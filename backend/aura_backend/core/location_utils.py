"""Shared helpers for location photos and 2GIS metadata."""

from __future__ import annotations

import re
from pathlib import Path

from django.conf import settings

CATEGORY_FALLBACK_PHOTOS: dict[str, str] = {
    "coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    "yoga": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
    "spa": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    "other": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
}


def normalize_category(category: str) -> str:
    normalized = category.lower()
    if any(token in normalized for token in ["кофей", "coffee", "кафе"]):
        return "coffee"
    if any(token in normalized for token in ["йога", "yoga", "studio", "студия", "fitness"]):
        return "yoga"
    if any(token in normalized for token in ["spa", "wellness", "sauna", "баня", "banya", "bathhouse"]):
        return "spa"
    return "other"


def normalize_tags(rubrics: str) -> list[str]:
    if not rubrics:
        return []
    return [f"#{tag.strip().replace(' ', '')}" for tag in rubrics.split(",") if tag.strip()]


def photos_dir() -> Path:
    return settings.BASE_DIR.parent.parent / "downloads_photos"


def find_local_photo_url(two_gis_id: str, name: str) -> str:
    directory = photos_dir()
    if not directory.exists():
        return ""

    name_norm = re.sub(r"[^a-z0-9]+", "", name.lower())
    for path in directory.iterdir():
        if not path.is_file():
            continue
        file_name = path.name.lower()
        file_stem = path.stem.lower()
        if two_gis_id and two_gis_id in file_name:
            return f"/downloads_photos/{path.name}"
        if name_norm and name_norm in file_stem:
            return f"/downloads_photos/{path.name}"
    return ""


def resolve_photo_url(raw_url: str, category: str) -> str:
    """Return a usable photo URL: local path, remote URL, or category fallback."""
    if raw_url:
        if raw_url.startswith(("http://", "https://", "data:")):
            return raw_url
        return raw_url if raw_url.startswith("/") else f"/{raw_url}"
    return CATEGORY_FALLBACK_PHOTOS.get(category, CATEGORY_FALLBACK_PHOTOS["other"])


def absolute_photo_url(request, photo_url: str, category: str) -> str:
    resolved = resolve_photo_url(photo_url, category)
    if resolved.startswith(("http://", "https://", "data:")):
        return resolved
    if request is not None:
        return request.build_absolute_uri(resolved)
    return resolved


def two_gis_firm_url(two_gis_id: str) -> str:
    if not two_gis_id:
        return ""
    return f"https://2gis.kz/almaty/firm/{two_gis_id}"
