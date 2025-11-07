import base64, io, re, os
from dataclasses import dataclass
from typing import Dict, Any, Optional

import cv2
import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO
import easyocr
from django.conf import settings
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

_yolo_model = None
_easyocr_reader = None
_damage_model = None
_damage_tf = None

def _get_yolo():
    global _yolo_model
    if _yolo_model is None:
        _yolo_model = YOLO(settings.YOLO_MODEL_NAME)
    return _yolo_model

def _get_easyocr():
    global _easyocr_reader
    if _easyocr_reader is None:
        _easyocr_reader = easyocr.Reader(['en'], gpu=False)
    return _easyocr_reader

def _get_damage():
    global _damage_model, _damage_tf
    if _damage_model is None:
        from torchvision import transforms
        from torchvision.models import mobilenet_v3_small
        _damage_tf = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225]),
        ])
        model = mobilenet_v3_small(weights=None)
        model.classifier[3] = torch.nn.Linear(model.classifier[3].in_features, 2)
        if os.path.exists(settings.DAMAGE_MODEL_PATH):
            model.load_state_dict(torch.load(settings.DAMAGE_MODEL_PATH, map_location="cpu"))
        model.eval()
        _damage_model = model
    return _damage_model, _damage_tf

def _cv2_to_pil(img: np.ndarray) -> Image.Image:
    return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

def is_blurry(img_bgr):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    return fm < settings.BLUR_LAPLACIAN_THRESHOLD, float(fm)

def detect_vehicle_bbox(img_bgr):
    model = _get_yolo()
    results = model.predict(_cv2_to_pil(img_bgr), verbose=False, imgsz=640)
    candidates = []
    for r in results:
        for box in r.boxes:
            cls = int(box.cls.item())
            if cls in [2, 3, 5, 7]:   # car / motorbike / bus / truck
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = box.conf.item()
                candidates.append((conf, [int(x1), int(y1), int(x2), int(y2)]))
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    x1, y1, x2, y2 = candidates[0][1]
    return {"x1": x1, "y1": y1, "x2": x2, "y2": y2}

def vehicle_is_full(img_bgr, bbox):
    if bbox is None:
        return False, 0.0
    h, w = img_bgr.shape[:2]
    x1, y1, x2, y2 = bbox.values()
    clipped = (x1 <= settings.BBOX_MARGIN_PIXELS) or (y1 <= settings.BBOX_MARGIN_PIXELS) or \
              (x2 >= w - settings.BBOX_MARGIN_PIXELS) or (y2 >= h - settings.BBOX_MARGIN_PIXELS)
    area_ratio = ((x2 - x1) * (y2 - y1)) / float(w * h + 1e-6)
    ok = (settings.VEHICLE_AREA_MIN <= area_ratio <= settings.VEHICLE_AREA_MAX) and not clipped
    score = max(0.0, min(1.0, 1.0 - abs(area_ratio - 0.5)))
    return ok, float(score)

def plate_is_legible(img_bgr):
    reader = _get_easyocr()
    # EasyOCR requiere BGR numpy, así que NO convertimos a PIL
    result = reader.readtext(img_bgr)  # <<--- CAMBIO IMPORTANTE

    best_text, best_conf = None, 0.0
    pattern = re.compile(settings.PLATE_REGEX)
    for _, text, conf in result:
        txt = text.upper().replace(" ", "").replace("-", "")
        if pattern.fullmatch(txt) and conf > best_conf:
            best_conf, best_text = float(conf), txt
    return (best_text is not None and best_conf >= settings.PLATE_CONFIDENCE_MIN), best_text, best_conf


def damage_detect(img_bgr):
    model, tf = _get_damage()
    if not os.path.exists(settings.DAMAGE_MODEL_PATH):
        return False, 0.0
    x = tf(_cv2_to_pil(img_bgr)).unsqueeze(0)
    with torch.no_grad():
        logits = model(x)
        prob = torch.softmax(logits, dim=1)[0, 1].item()
    return bool(prob >= 0.5), float(prob)

def _b64_to_cv2(b64: str) -> np.ndarray:
    print("\n=== RECEIVED BASE64 LENGTH:", len(b64), "===")

    if "," in b64:
        b64 = b64.split(",")[-1]

    b64 = b64.strip().replace("\n", "").replace("\r", "").replace(" ", "")

    try:
        decoded = base64.b64decode(b64, validate=False)
    except Exception:
        missing_padding = len(b64) % 4
        if missing_padding:
            b64 += "=" * (4 - missing_padding)
        decoded = base64.b64decode(b64, validate=False)

    print("Decoded bytes:", len(decoded))

    try:
        img = Image.open(io.BytesIO(decoded))
        img = img.convert("RGB")
        img = np.array(img)
        # Convertimos a RGB porque YOLO trabaja en RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    except Exception as e:
        print("❌ ERROR DECODING IMAGE:", e)
        return None

    print("✅ _b64_to_cv2 OUTPUT:", type(img), img.shape, img.dtype)
    return img


def _to_native(obj):
    if isinstance(obj, (np.bool_, np.bool8)):
        return bool(obj)
    if isinstance(obj, (np.float32, np.float64, np.number)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj

def analyze_image(b64: str) -> dict:
    # Convertir base64 → OpenCV BGR
    img = _b64_to_cv2(b64)   # <<--- Primero convertimos

    # DEBUG AHORA SÍ, CUANDO img EXISTE
    print("=== DEBUG IMAGE FOR YOLO ===")
    print("Type:", type(img))
    print("Shape:", getattr(img, "shape", None))
    print("Dtype:", getattr(img, "dtype", None))
    print("Is contiguous:", img.flags['C_CONTIGUOUS'] if isinstance(img, np.ndarray) else None)
    print("============================")

    # --- VEHICLE DETECTION (YOLO) ---
    model = _get_yolo()

    img_pil = Image.fromarray(img)   # Convertimos la matriz numpy → PIL
    results = model.predict(img_pil, imgsz=640, verbose=False)
    detections = results[0].boxes

    vehicle_detected = len(detections) > 0
    bbox = None
    if vehicle_detected:
        x1, y1, x2, y2 = detections[0].xyxy[0].cpu().numpy().tolist()
        bbox = {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)}

    # --- PHOTO BLUR DETECTION ---
    blurry, blur_score = is_blurry(img)

    # --- VEHICLE FULL FRAME CHECK ---
    full_ok, full_score = vehicle_is_full(img, bbox)

    # --- PLATE OCR ---
    plate_ok, plate_text, plate_conf = plate_is_legible(img)

    return {
    "vehicle_detected": _to_native(vehicle_detected),
    "vehicle_bbox": bbox,
    "is_blurry": _to_native(blurry),
    "blur_score": _to_native(blur_score),
    "vehicle_full": _to_native(full_ok),
    "vehicle_full_score": _to_native(full_score),
    "plate_detected": _to_native(plate_ok),
    "plate_text": plate_text,
    "plate_confidence": _to_native(plate_conf)
}
