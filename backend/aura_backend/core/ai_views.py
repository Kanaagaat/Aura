# backend/aura_backend/core/ai_views.py
import json
import os

from rest_framework import permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Beacon, Location, UserProfile
from .serializers import LocationSerializer


def _haiku_client():
    import anthropic  # lazy import so startup isn't blocked if package missing
    return anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


# ─── Vibe Search ─────────────────────────────────────────────────────────────

class VibeSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        mood = (request.data.get("mood") or "").strip()[:300]
        if not mood:
            return Response(
                {"data": None, "error": {"code": "missing_mood", "message": "mood is required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        locations = list(
            Location.objects.only("id", "name", "category", "vibe_tags", "editorial_note")
        )

        venue_list = "\n".join(
            f'- id={loc.id} name="{loc.name}" category={loc.category} '
            f'tags={",".join(loc.vibe_tags[:4])} editorial="{loc.editorial_note[:80]}"'
            for loc in locations
        )

        prompt = (
            f'User mood: "{mood}"\n\n'
            f"Venue list:\n{venue_list}\n\n"
            "Return JSON only (no markdown). Format:\n"
            '{"location_ids":[<top 3-5 matching ids>],"reasons":{"<id>":"<one short phrase>"},'
            '"vibe_summary":"<one sentence for the user>"}'
        )

        try:
            client = _haiku_client()
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=512,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = msg.content[0].text.strip()
            parsed = json.loads(raw)
            ids = [int(i) for i in parsed.get("location_ids", [])]
            reasons: dict = parsed.get("reasons", {})
            vibe_summary: str = parsed.get("vibe_summary", "")
        except Exception:
            # Graceful fallback: return first 5 locations, no AI summary
            ids = [loc.id for loc in locations[:5]]
            reasons = {}
            vibe_summary = None  # type: ignore[assignment]

        matched = [loc for loc in locations if loc.id in ids]
        ser = LocationSerializer(matched, many=True, context={"request": request})
        result = []
        for item in ser.data:
            result.append({**item, "reason": reasons.get(str(item["id"]), "")})

        return Response({"data": {"locations": result, "vibe_summary": vibe_summary}, "error": None})


# ─── Compatibility Score ──────────────────────────────────────────────────────

class CompatibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        beacon_id = request.query_params.get("beacon_id")
        if not beacon_id:
            return Response(
                {"data": None, "error": {"code": "missing_beacon_id", "message": "beacon_id is required."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            beacon = Beacon.objects.select_related("creator__user").get(id=int(beacon_id))
        except (Beacon.DoesNotExist, ValueError):
            return Response(
                {"data": None, "error": {"code": "not_found", "message": "Beacon not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            my_profile: UserProfile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response({"data": {"score": None, "explanation": None}, "error": None})

        creator = beacon.creator
        my_interests = set(my_profile.interests or [])
        their_interests = set(creator.interests or [])

        # Jaccard similarity → 0–100
        union = my_interests | their_interests
        intersection = my_interests & their_interests
        score: int | None = round(len(intersection) / len(union) * 100) if union else None

        explanation: str | None = None
        try:
            client = _haiku_client()
            prompt = (
                f'Person A: vibe_word="{my_profile.vibe_word}", interests={list(my_interests)}\n'
                f'Person B: vibe_word="{creator.vibe_word}", interests={list(their_interests)}\n'
                "Write a single sentence (≤15 words) explaining what they have in common. "
                "Be warm and specific. No quotes."
            )
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=80,
                messages=[{"role": "user", "content": prompt}],
            )
            explanation = msg.content[0].text.strip()
        except Exception:
            if intersection:
                explanation = f"Both enjoy {' and '.join(list(intersection)[:2])}."

        return Response({"data": {"score": score, "explanation": explanation}, "error": None})
