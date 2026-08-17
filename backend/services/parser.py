import os, re, json, logging
from datetime import date
from typing import Optional

logger = logging.getLogger("parser")

CATEGORIES = [
    "Food & Drinks", "Travel", "Health & Wellness",
    "Online Subscriptions", "Shopping", "Other",
]

KEYWORD_MAP = {
    "Food & Drinks": ["swiggy", "zomato", "restaurant", "cafe", "coffee", "dinner", "lunch", "breakfast", "food", "pizza", "burger"],
    "Travel": ["uber", "ola", "flight", "train", "bus", "cab", "taxi", "fuel", "petrol", "diesel", "irctc",
               "travel", "ride", "auto", "rickshaw", "metro", "rapido"],
    "Health & Wellness": ["pharmacy", "medicine", "doctor", "hospital", "gym", "medical", "clinic"],
    "Online Subscriptions": ["netflix", "spotify", "prime", "subscription", "youtube premium", "hotstar"],
    "Shopping": ["amazon", "flipkart", "myntra", "mall", "clothes", "shoes", "shopping"],
}

AMOUNT_RE = re.compile(r"(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d{1,2})?)", re.IGNORECASE)


def keyword_parse(text: str) -> Optional[dict]:
    lower = text.lower()
    amount_match = AMOUNT_RE.search(text)
    if not amount_match:
        return None

    category = None
    for cat, keywords in KEYWORD_MAP.items():
        if any(kw in lower for kw in keywords):
            category = cat
            break
    if not category:
        return None

    amount = float(amount_match.group(1))
    title = AMOUNT_RE.sub("", text).strip(" -on for").strip()
    title = title[:1].upper() + title[1:] if title else category

    return {
        "title": title[:25] or category,
        "amount": amount,
        "category": category,
        "date": date.today().isoformat(),
    }


async def gemini_parse(text: str) -> Optional[dict]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    import httpx
    prompt = (
        "Extract an expense from this text. Reply with ONLY compact JSON, no markdown, "
        f'in this exact shape: {{"title": string (max 25 chars), "amount": number, '
        f'"category": one of {CATEGORIES}}}. Text: "{text}"'
    )
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-flash-lite-latest:generateContent?key={api_key}"
    )
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"thinkingConfig": {"thinkingBudget": 0}},
    }

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.post(url, json=body)
            resp.raise_for_status()
            parts = resp.json()["candidates"][0]["content"]["parts"]
            raw = "".join(p.get("text", "") for p in parts if not p.get("thought"))
            raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            parsed = json.loads(raw)

        if parsed.get("category") not in CATEGORIES:
            parsed["category"] = "Other"
        parsed["date"] = date.today().isoformat()
        parsed["title"] = str(parsed.get("title", "Expense"))[:25]
        parsed["amount"] = float(parsed["amount"])
        return parsed
    except Exception as e:
        logger.warning(f"Gemini parse failed: {type(e).__name__}: {e}")
        return None


async def parse_expense_text(text: str) -> dict:
    result = keyword_parse(text)
    if result:
        return {**result, "source": "keyword"}

    ai_result = await gemini_parse(text)
    if ai_result:
        return {**ai_result, "source": "ai"}

    amount_match = AMOUNT_RE.search(text)
    return {
        "title": text[:25],
        "amount": float(amount_match.group(1)) if amount_match else 0,
        "category": "Other",
        "date": date.today().isoformat(),
        "source": "fallback",
    }