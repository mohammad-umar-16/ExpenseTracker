import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from services.parser import keyword_parse


def test_keyword_parse_travel():
    result = keyword_parse("500 to travel from lajpat nagar to okhla")
    assert result is not None
    assert result["category"] == "Travel"
    assert result["amount"] == 500

def test_keyword_parse_food():
    result = keyword_parse("250 swiggy dinner")
    assert result["category"] == "Food & Drinks"
    assert result["amount"] == 250

def test_keyword_parse_no_keyword_match_returns_none():
    result = keyword_parse("300 for something with no matching keyword")
    assert result is None

def test_keyword_parse_no_amount_returns_none():
    result = keyword_parse("swiggy dinner")
    assert result is None

def test_keyword_parse_note_captures_overflow():
    result = keyword_parse("120 uber ride to the airport for my early morning flight")
    assert result is not None
    assert result["category"] == "Travel"
    assert len(result["title"]) <= 25