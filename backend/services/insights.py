import os, json, logging
from typing import Optional

logger = logging.getLogger("insights")


def _rule_based(total: float, cats: dict, prev_total: float, prev_cats: dict) -> list[str]:
    out = []
    if prev_total > 0:
        change = round((total - prev_total) / prev_total * 100)
        if change > 0:
            out.append(f"You spent {change}% more this month than last month.")
        elif change < 0:
            out.append(f"You spent {abs(change)}% less this month than last month.")
        else:
            out.append("Your spending is flat compared to last month.")
    if cats:
        top_cat = max(cats, key=cats.get)
        out.append(f"{top_cat} was your biggest category this month.")
    biggest_jump, biggest_delta = None, 0
    for c, amt in cats.items():
        prev_amt = prev_cats.get(c, 0)
        delta = amt - prev_amt
        if delta > biggest_delta:
            biggest_delta, biggest_jump = delta, c
    if biggest_jump:
        out.append(f"{biggest_jump} increased the most compared to last month.")
    return out[:3]


async def _gemini_narrate(total, cats, prev_total, prev_cats) -> Optional[list[str]]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    import httpx
    prompt = (
        "Given this month's spending data, write 2-3 short factual observations "
        "(each under 15 words, no markdown, no bullet symbols) a person would find useful. "
        "Only state facts derivable from the numbers below — never invent data. "
        "Reply as a JSON array of strings only.\n\n"
        f"This month total: {total}, by category: {cats}\n"
        f"Last month total: {prev_total}, by category: {prev_cats}"
    )
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-flash-lite-latest:generateContent?key={api_key}"
    )
    body = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.post(url, json=body)
            resp.raise_for_status()
            raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            parsed = json.loads(raw)
        if isinstance(parsed, list) and all(isinstance(x, str) for x in parsed):
            return parsed[:3]
        return None
    except Exception as e:
        logger.warning(f"Gemini insights failed: {type(e).__name__}: {e}")
        return None


async def build_insights(total: float, cats: dict, prev_total: float, prev_cats: dict) -> list[str]:
    if total == 0 and prev_total == 0:
        return []
    ai_result = await _gemini_narrate(total, cats, prev_total, prev_cats)
    return ai_result if ai_result else _rule_based(total, cats, prev_total, prev_cats)