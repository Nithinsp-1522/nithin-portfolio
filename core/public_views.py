from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404


BASE_DIR = Path(settings.BASE_DIR).resolve()


def public_file(request, filename):
    candidate = (BASE_DIR / filename).resolve()
    try:
        candidate.relative_to(BASE_DIR)
    except ValueError:
        raise Http404
    if not candidate.is_file():
        raise Http404
    return FileResponse(open(candidate, "rb"), content_type=_content_type(candidate.suffix))


def _content_type(suffix):
    return {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".ico": "image/x-icon",
    }.get(suffix.lower(), "application/octet-stream")
