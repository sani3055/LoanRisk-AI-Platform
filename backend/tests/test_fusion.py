from app.services.fusion import classify_risk, fuse_scores


def test_no_text_preserves_structured_score():
    assert fuse_scores(0.45, 1.0, False) == 0.45


def test_text_is_weighted_85_15():
    assert fuse_scores(0.75, 0.92, True) == 0.7755


def test_risk_thresholds():
    assert classify_risk(0.29) == "LOW RISK"
    assert classify_risk(0.30) == "MEDIUM RISK"
    assert classify_risk(0.61) == "HIGH RISK"
