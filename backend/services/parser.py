async def gemini_parse_image(image_base64: str, mime_type: str) -> Optional[dict]:
    """Reads a receipt photo directly via Gemini's multimodal input."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    import httpx
    prompt = (
        "This image is a receipt or bill. Extract a single expense from it. "
        "Reply with ONLY compact JSON, no markdown, in this exact shape: "
        f'{{"title": string (max 25 chars, e.g. merchant name), "amount": number (the total amount), '
        f'"category": one of {CATEGORIES}, "note": string (max 50 chars, extra useful detail, '
        'or empty string if none)}. If you cannot read a total amount, set amount to 0.'
    )
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-flash-lite-latest:generateContent?key={api_key}"
    )
    body = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": mime_type, "data": image_base64}},
            ]
        }]
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(url, json=body)
            resp.raise_for_status()
            parts = resp.json()["candidates"][0]["content"]["parts"]
            raw = "".join(p.get("text", "") for p in parts if not p.get("thought"))
            raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            parsed = json.loads(raw)

        if parsed.get("category") not in CATEGORIES:
            parsed["category"] = "Other"
        parsed["date"] = date.today().isoformat()
        parsed["title"] = str(parsed.get("title", "Receipt"))[:25]
        parsed["note"] = str(parsed.get("note", ""))[:50]
        parsed["amount"] = float(parsed.get("amount", 0))
        return parsed
    except Exception as e:
        detail = getattr(getattr(e, "response", None), "text", "")
        logger.warning(f"Gemini image parse failed: {type(e).__name__}: {e} | {detail}")
        return None


async def parse_expense_image(image_base64: str, mime_type: str) -> dict:
    result = await gemini_parse_image(image_base64, mime_type)
    if result:
        return {**result, "source": "ai-image"}
    return {
        "title": "",
        "amount": 0,
        "category": "Other",
        "note": "",
        "date": date.today().isoformat(),
        "source": "fallback",
    }