# AI Smart Surveillance System — Project Scaffold

Built against the SRS provided by iFlair. This scaffold covers the **AI detection core**
first (Phase 1: uploaded video, Phase 2: live webcam) since that's the hard technical part.
Auth/RBAC, incident management, and reports (also in the SRS) are intentionally left as
TODOs — add them once detection is working and demoable.

## Folder structure

```
ai-surveillance/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entrypoint
│   │   ├── api/
│   │   │   ├── upload.py            # Phase 1: POST /api/videos/upload
│   │   │   ├── live.py              # Phase 2: WS /api/live/webcam
│   │   │   └── detections.py        # placeholder for DB-backed history/reports
│   │   ├── ai/
│   │   │   ├── yolo_detector.py     # person + vehicle + bag detection (YOLOv8)
│   │   │   ├── abandoned_object.py  # tracks stationary bags -> "abandoned" alert
│   │   │   ├── fire_smoke_detector.py  # needs a fine-tuned model (see file for options)
│   │   │   └── face_detector.py     # face detection demo (MediaPipe)
│   │   ├── services/
│   │   │   └── video_processor.py   # shared pipeline used by BOTH phases
│   │   ├── core/                    # (empty) config/db setup goes here
│   │   └── models/                  # (empty) SQLAlchemy models go here
│   ├── quick_test.py                # run detection without FastAPI/React at all
│   └── requirements.txt
└── frontend/                        # (empty) React/Next.js app goes here
```

## Why this structure

- **`video_processor.py` is the key file.** Both phases call `process_source()` —
  Phase 1 passes a file path, Phase 2 passes `0` (webcam index). The detection logic
  is identical; only the input source changes. Build and test Phase 1 thoroughly first.
- **`ai/` modules are independent** — you can develop/test person detection, abandoned
  object logic, and fire/smoke separately before wiring them all together.
- **`quick_test.py` skips the whole web stack** so you can validate the AI pipeline
  in a plain OpenCV window before touching FastAPI or React at all.

## How to start (recommended order)

### 1. Set up the backend environment
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Quick-test person detection on a sample video (no server needed)
```bash
python quick_test.py path/to/sample_video.mp4
```
This opens a window showing bounding boxes live and prints alerts to the console.
Use any video with a person walking, a bag being left behind, etc. This is your
fastest feedback loop — get this working before anything else.

### 3. Handle fire/smoke
`yolo_detector.py` only covers person/vehicle/bags — YOLOv8's COCO weights have no
fire/smoke class. Read the comments in `fire_smoke_detector.py`: download a pretrained
fire/smoke YOLOv8 model from Roboflow Universe (fastest), or fine-tune your own if you
want to show more ML work in the demo.

### 4. Bring up the FastAPI server
```bash
uvicorn app.main:app --reload --port 8000
```
Test the upload endpoint with curl or Postman:
```bash
curl -X POST -F "file=@sample_video.mp4" http://localhost:8000/api/videos/upload
```

### 5. Build the React/Next.js frontend
Minimum for Phase 1 demo: an upload form + a page that plays back the annotated
output video and lists the alerts JSON returned by the API.

### 6. Phase 2 — swap to webcam
Once Phase 1 works end-to-end, connect the frontend to the `/api/live/webcam`
WebSocket instead of the upload form. The backend logic barely changes — this
is intentional, see `video_processor.py`.

### 7. Only after both phases work: add DB persistence, auth/RBAC, reports
These are real SRS requirements but are separable "wrapper" work — don't let them
block getting the AI detection demoable first.

## Known gaps to fill in yourself

- **PostgreSQL models** (`app/models/`) aren't built yet — `detections.py` has a
  placeholder route. Add SQLAlchemy models per the SRS's Database Entities section
  (Users, Roles, Camera, Alerts, Incidents, etc.) when you get to persistence.
- **Fire/smoke weights** aren't included — you must source or train these (see step 3).
- **Auth/RBAC** isn't implemented — SRS wants Super Admin / Security Manager roles;
  add this after the core AI loop is solid.
