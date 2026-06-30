import re

# Custom medical and hospitality sentiment lexicon
POSITIVE_WORDS = {
    "excellent", "good", "great", "best", "satisfied", "happy", "caring", "polite",
    "helpful", "clean", "hygienic", "successful", "cured", "recovered", "saved",
    "affordable", "reasonable", "kind", "patient", "recommend", "highly", "care",
    "professional", "expert", "well", "cooperative", "fast", "efficient", "modern",
    "top-class", "friendly", "compassionate"
}

NEGATIVE_WORDS = {
    "worst", "bad", "rude", "negligent", "careless", "unhygienic", "dirty", "expensive",
    "overcharged", "fraud", "unhelpful", "delayed", "waiting", "slow", "poor", "painful",
    "complications", "unprofessional", "arrogant", "refused", "loot", "scam", "waste",
    "carelessness", "inefficient", "crowded", "dirty", "unfriendly", "billing", "high cost"
}

def analyze_review_sentiment(text: str, rating: int) -> float:
    """
    Analyzes review text sentiment using custom medical/hospital lexicon,
    blending it with the raw star rating to return a score from 0.0 to 100.0.
    """
    if not text:
        # Fallback to rating only
        return float(rating * 20.0)
    
    # Normalize text
    text_clean = re.sub(r'[^\w\s]', '', text.lower())
    words = text_clean.split()
    
    pos_count = 0
    neg_count = 0
    
    # Check for matching words
    for word in words:
        if word in POSITIVE_WORDS:
            pos_count += 1
        elif word in NEGATIVE_WORDS:
            neg_count += 1
            
    # Check for bigram/phrase matches
    phrases_pos = ["highly recommend", "caring staff", "clean hospital", "well mannered", "reasonable price"]
    phrases_neg = ["waste of money", "rude behavior", "no hygiene", "long wait", "hidden charges"]
    
    for phrase in phrases_pos:
        if phrase in text_clean:
            pos_count += 2
            
    for phrase in phrases_neg:
        if phrase in text_clean:
            neg_count += 2
            
    # Compute base text sentiment (starts at 50, shifts based on matches)
    diff = pos_count - neg_count
    text_sentiment = 50.0 + (diff * 12.0)
    text_sentiment = max(0.0, min(100.0, text_sentiment))
    
    # Blend with rating (rating * 20 maps 1-5 to 20-100)
    rating_sentiment = rating * 20.0
    
    # 60% text sentiment + 40% rating
    blended_score = (0.6 * text_sentiment) + (0.4 * rating_sentiment)
    return round(blended_score, 1)
