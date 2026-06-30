import unittest
import sys
import os

# Adjust path to find app module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import recommender, sentiment, tqi, models

class TestMediGuideCore(unittest.TestCase):
    
    def test_condition_translation(self):
        # Test English and Hinglish condition translation
        self.assertEqual(recommender.translate_condition("Heart attack"), "Cardiology")
        self.assertEqual(recommender.translate_condition("dil me dard"), "Cardiology")
        self.assertEqual(recommender.translate_condition("Kidney stone removal"), "Urology")
        self.assertEqual(recommender.translate_condition("pathri operation"), "Urology")
        self.assertEqual(recommender.translate_condition("bone fracture"), "Orthopedics")
        self.assertEqual(recommender.translate_condition("knee joint replacement"), "Orthopedics")
        self.assertEqual(recommender.translate_condition("cancer treatment"), "Oncology")
        self.assertEqual(recommender.translate_condition("pregnancy delivery cost"), "Gynecology")
        self.assertEqual(recommender.translate_condition("unknown disease symptom"), "General Medicine")
        
    def test_sentiment_analysis(self):
        # Test positive review text and rating blend
        pos_score = sentiment.analyze_review_sentiment("Excellent treatment. The doctors were very caring and professional. Clean facilities.", 5)
        self.assertTrue(pos_score > 80.0)
        
        # Test negative review text and rating blend
        neg_score = sentiment.analyze_review_sentiment("Worst hospital ever, rude staff and unhygienic toilets. Billing is a scam.", 1)
        self.assertTrue(neg_score < 30.0)
        
        # Neutral review
        neutral_score = sentiment.analyze_review_sentiment("The treatment was okay, but we had to wait for a long time.", 3)
        self.assertTrue(35.0 <= neutral_score <= 75.0)

    def test_accreditation_score(self):
        self.assertEqual(tqi.calculate_accreditation_score("NABH,JCI"), 100.0)
        self.assertEqual(tqi.calculate_accreditation_score("JCI"), 95.0)
        self.assertEqual(tqi.calculate_accreditation_score("NABH"), 85.0)
        self.assertEqual(tqi.calculate_accreditation_score("ISO"), 70.0)
        self.assertEqual(tqi.calculate_accreditation_score(""), 50.0)

    def test_emergency_score(self):
        # Create a mock hospital model
        h_good = models.Hospital(emergency_available=True, icu_beds=15)
        h_mid = models.Hospital(emergency_available=True, icu_beds=5)
        h_bad = models.Hospital(emergency_available=False, icu_beds=0)
        
        self.assertEqual(tqi.calculate_emergency_score(h_good), 100.0)
        self.assertEqual(tqi.calculate_emergency_score(h_mid), 85.0)
        self.assertEqual(tqi.calculate_emergency_score(h_bad), 30.0)

if __name__ == "__main__":
    unittest.main()
