"""
Abandoned Object detection.

IMPORTANT: this is NOT a single-shot model - YOLOv8 gives you object boxes
per frame, but "abandoned" is a *temporal* concept. The logic here:

1. Every frame, get all non-person object boxes from YOLOv8 (e.g. "backpack",
   "suitcase", "handbag" - COCO class ids 24, 26, 28).
2. Track each object's position across frames using a simple centroid tracker
   (good enough for a training project; swap for ByteTrack/DeepSORT if you
   need robustness with occlusion/multiple objects).
3. If an object's centroid stays within a small radius for more than
   STATIONARY_SECONDS, AND no person has been within NEAR_DISTANCE_PX of it
   for that whole time, flag it as "abandoned".

This keeps the logic simple and explainable for a training project /
demo to your mentor, while still being a genuine (not hardcoded) detection.
"""
import time
import math

# COCO class ids for objects that make sense to flag as "left behind"
BAG_CLASS_IDS = {24: "backpack", 26: "handbag", 28: "suitcase", 25: "umbrella", 75: "vase"}
STATIONARY_SECONDS = 10       # how long an object must stay still to count as abandoned
STATIONARY_RADIUS_PX = 25     # how much movement is tolerated as "still"
NEAR_DISTANCE_PX = 150        # how close a person must be to "claim" the object
GRACE_PERIOD_SECONDS = 3      # keep tracking an object through brief detection gaps
                               # (flaky confidence shouldn't reset the stationary timer)


class TrackedObject:
    def __init__(self, obj_id, centroid, label, now):
        self.id = obj_id
        self.label = label
        self.first_seen = now
        self.last_centroid = centroid
        self.last_moved_at = now
        self.last_person_nearby_at = now
        self.last_seen_at = now
        self.flagged = False


class AbandonedObjectTracker:
    def __init__(self):
        self.tracked_objects = {}
        self.next_id = 0

    @staticmethod
    def _centroid(bbox):
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)

    @staticmethod
    def _distance(p1, p2):
        return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

    def update(self, detections, current_time):
        """
        detections: full list of YOLO detections for the current frame
        (from yolo_detector.detect, extended to include bag classes).
        current_time: seconds - either video time (frame_index / fps) for
        uploaded files, or time.time() (wall clock) for a live webcam.
        Returns a list of alerts: [{"object_id", "label", "message"}]
        """
        now = current_time
        person_centroids = [
            self._centroid(d["bbox"]) for d in detections if d["label"] == "person"
        ]
        bag_detections = [d for d in detections if d.get("class_id") in BAG_CLASS_IDS]

        alerts = []
        matched_ids = set()

        for det in bag_detections:
            centroid = self._centroid(det["bbox"])
            best_match_id, best_dist = None, float("inf")

            for obj_id, tracked in self.tracked_objects.items():
                dist = self._distance(centroid, tracked.last_centroid)
                if dist < best_dist:
                    best_match_id, best_dist = obj_id, dist

            if best_match_id is not None and best_dist < 60:
                # Same object as before - update its state
                tracked = self.tracked_objects[best_match_id]
                if best_dist > STATIONARY_RADIUS_PX:
                    tracked.last_moved_at = now  # it moved, reset the "still" timer
                tracked.last_centroid = centroid
                tracked.last_seen_at = now
                matched_ids.add(best_match_id)
            else:
                # New object - start tracking it
                obj_id = self.next_id
                self.next_id += 1
                self.tracked_objects[obj_id] = TrackedObject(obj_id, centroid, det["label"], now)
                tracked = self.tracked_objects[obj_id]
                matched_ids.add(obj_id)

            # Check if a person is near this object right now
            if any(self._distance(centroid, p) < NEAR_DISTANCE_PX for p in person_centroids):
                tracked.last_person_nearby_at = now

            # Decide if it counts as "abandoned"
            stationary_duration = now - tracked.last_moved_at
            time_since_person = now - tracked.last_person_nearby_at

            print(f"[TRACK] id={tracked.id} label={tracked.label} "
                  f"stationary={stationary_duration:.1f}s no_person={time_since_person:.1f}s")

            if (
                stationary_duration > STATIONARY_SECONDS
                and time_since_person > STATIONARY_SECONDS
                and not tracked.flagged
            ):
                tracked.flagged = True
                alerts.append({
                    "object_id": tracked.id,
                    "label": tracked.label,
                    "message": f"Abandoned {tracked.label} detected (unattended for "
                               f"{int(stationary_duration)}s)",
                })

        # Drop objects only after they've been missing for longer than the grace
        # period - this prevents brief detection flicker (a frame or two where
        # confidence dips below threshold) from wiping out the stationary timer
        # and making the object look "new" again every time it reappears.
        self.tracked_objects = {
            k: v for k, v in self.tracked_objects.items()
            if k in matched_ids or (now - v.last_seen_at) < GRACE_PERIOD_SECONDS
        }

        return alerts
