from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from . import models, recommender

def parse_chatbot_message(db: Session, msg: str, context_hospital_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Simulates a context-aware medical chatbot. Parses queries, searches the SQLite DB,
    and returns a structured, empathetic response with suggested actions.
    """
    msg_lower = msg.lower().strip()
    
    # Let's check context hospital first
    hospital = None
    if context_hospital_id:
        hospital = db.query(models.Hospital).filter(models.Hospital.id == context_hospital_id).first()
        
    reply = ""
    suggested_actions = []
    
    # Scenario 1: User is looking at a specific hospital and asks a contextual question
    if hospital:
        if any(w in msg_lower for w in ["doctor", "specialist", "head", "physician", "surgeon"]):
            # Doctor query
            doctors = hospital.doctors
            if doctors:
                doc_list = "\n".join([f"- Dr. {d.name} ({d.specialty}) - {d.experience_years} years exp, speaks {d.languages}" for d in doctors[:4]])
                reply = f"At **{hospital.name}**, we have a dedicated team of specialist doctors. Here are some of our key specialists:\n\n{doc_list}\n\nWould you like me to look up a specific department's head doctor?"
            else:
                reply = f"I couldn't find a detailed doctor list for **{hospital.name}**. However, they have active specialists across major departments."
            suggested_actions = ["Compare doctors", "View Cardiology department"]
            
        elif any(w in msg_lower for w in ["cost", "price", "charge", "fee", "estimate", "budget", "rupee", "inr"]):
            # Cost query
            costs = hospital.cost_estimates
            if costs:
                cost_list = "\n".join([f"- **{c.treatment_name}**: ₹{c.cost_min:,} to ₹{c.cost_max:,}" for c in costs])
                reply = f"Here are the estimated treatment costs at **{hospital.name}**:\n\n{cost_list}\n\n*Note: These are estimates based on published rates and verified patients. Actual costs may vary depending on patient condition and room choice.*"
            else:
                reply = f"I don't have direct treatment cost cards for **{hospital.name}**. Generally, consultation fees are around ₹500 - ₹800."
            suggested_actions = ["Check insurance coverage", "Compare treatment costs"]
            
        elif any(w in msg_lower for w in ["insurance", "policy", "cover", "star", "hdfc", "ergo", "tpa"]):
            # Insurance query
            panels = hospital.insurance_panels
            if panels:
                reply = f"**{hospital.name}** is empaneled with the following insurance providers for cashless treatments:\n\n✔️ {', '.join(panels.split(','))}\n\nIf your insurer is listed, you can avail of cashless admission subject to pre-authorization."
            else:
                reply = f"I do not have the cashless insurance panel list for **{hospital.name}**. I recommend calling their TPA desk directly at {hospital.phone}."
            suggested_actions = ["Compare insurance panels", "Call hospital desk"]
            
        elif any(w in msg_lower for w in ["accreditation", "nabh", "jci", "quality", "certif"]):
            # Accreditation query
            accs = hospital.accreditation
            if accs:
                reply = f"**{hospital.name}** holds the following quality credentials:\n\n🏆 {', '.join(accs.split(','))}\n\nThis reflects their compliance with international standards for clinical safety and patient care."
            else:
                reply = f"**{hospital.name}** is a verified facility on our platform, though they do not currently list JCI or NABH certifications."
            suggested_actions = ["What is TQI score?", "Check infrastructure details"]
            
        elif any(w in msg_lower for w in ["emergency", "icu", "bed", "icu beds", "ventilator", "trauma"]):
            # Emergency/ICU query
            reply = f"**{hospital.name}** emergency details:\n"
            reply += f"- **24/7 Emergency Support**: {'✅ Available' if hospital.emergency_available else '❌ Not Available'}\n"
            reply += f"- **Total Beds**: {hospital.total_beds} beds\n"
            reply += f"- **ICU Beds**: {hospital.icu_beds} beds\n"
            reply += f"- **Operation Theatres (OT)**: {hospital.ot_count} units\n\n"
            reply += f"If this is a critical emergency, please activate **Emergency Mode** on the homepage to find instant ambulance connections."
            suggested_actions = ["Activate Emergency Mode", "Call Emergency: " + hospital.phone]
            
        elif any(w in msg_lower for w in ["rating", "review", "sentiment", "patient"]):
            # Reviews query
            reviews = hospital.reviews
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
                avg_sentiment = sum(r.sentiment_score for r in reviews) / len(reviews)
                reply = f"Patient satisfaction at **{hospital.name}** is rated **{avg_rating:.1f}/5** based on {len(reviews)} reviews.\n\n"
                reply += f"Our AI review sentiment analysis score is **{avg_sentiment:.1f}/100**, indicating a highly positive patient outcome profile.\n\n"
                reply += f"Key feedback: Patients praise the cleanliness and doctor expertise, though some note waiting times in the billing department."
            else:
                reply = f"There are no patient reviews posted for **{hospital.name}** yet. You can be the first to submit feedback."
            suggested_actions = ["Read reviews", "Write a review"]
            
    # Scenario 2: General recommendation request or query mapping
    if not reply:
        # Check if they are searching for a condition
        category = recommender.translate_condition(msg_lower)
        
        # Check if they mentioned a city
        detected_city = None
        for city in ["chennai", "hyderabad", "bangalore", "pune", "jaipur"]:
            if city in msg_lower:
                detected_city = city
                break
                
        if category != "General Medicine" or detected_city:
            city_name = detected_city or "pune" # default
            reply = f"I detected that you are looking for **{category}** services in **{city_name.capitalize()}**.\n\n"
            
            # Find top hospitals
            hospitals = db.query(models.Hospital).filter(models.Hospital.city.ilike(city_name)).all()
            scored_hosp = []
            for h in hospitals:
                dept = next((d for d in h.departments if d.name.lower() == category.lower()), None)
                tqi = dept.tqi_score if dept else 70.0
                scored_hosp.append((h, tqi))
            scored_hosp.sort(key=lambda x: x[1], reverse=True)
            
            if scored_hosp:
                list_str = "\n".join([f"{i+1}. **{h.name}** (TQI: {tqi}/100, {h.type.capitalize()})" for i, (h, tqi) in enumerate(scored_hosp[:3])])
                reply += f"Based on the Treatment Quality Index (TQI), here are the top 3 recommended hospitals:\n\n{list_str}\n\nWould you like me to show their treatment cost estimates or check insurance compatibility?"
            else:
                reply += f"I couldn't find any hospitals listing {category} services in {city_name.capitalize()} in our current database."
            suggested_actions = [f"Recommend for {category} in {city_name.capitalize()}", "View cost ranges"]
            
        elif any(w in msg_lower for w in ["hi", "hello", "hey", "greetings", "help", "guide"]):
            reply = "Hello! I am your **MediGuide AI Assistant**. 🩺\n\nI can help you:\n"
            reply += "1. Find the best hospital for a specific disease or surgery (e.g., 'best cardiology hospital in Pune').\n"
            reply += "2. Understand Treatment Quality Index (TQI) scores and components.\n"
            reply += "3. Look up treatment costs, specialist doctor lists, and accepted insurance networks.\n\n"
            reply += "If you are viewing a hospital profile, I can answer specific questions about it. How can I help you today?"
            suggested_actions = ["Best Cardiology in Pune", "What is TQI?", "Emergency Mode"]
            
        elif "tqi" in msg_lower or "treatment quality index" in msg_lower:
            reply = "The **Treatment Quality Index (TQI)** is our proprietary, research-grade hospital evaluation index. Unlike raw Google star ratings, TQI is calculated per treatment category (e.g., Cardiology, Oncology) using 7 weighted criteria:\n\n"
            reply += "- **Specialist Score (25%)**: Count, qualifications, and experience of doctors.\n"
            reply += "- **Infrastructure (20%)**: ICU beds, operating theatres, cath labs, MRI machines.\n"
            reply += "- **Patient Satisfaction (15%)**: AI sentiment analysis of review logs.\n"
            reply += "- **Affordability (10%)**: Cost relative to city average.\n"
            reply += "- **Accreditation (10%)**: NABH, JCI certifications.\n"
            reply += "- **Emergency Readiness (10%)**: 24x7 trauma desk, ambulance dispatch.\n"
            reply += "- **Outcome Proxy (10%)**: Discharge rate and clinical stability factors.\n\n"
            reply += "You can adjust these weights in the **Admin Panel** to customize rankings according to your priorities."
            suggested_actions = ["Open Admin weights", "Search cardiology hospitals"]
            
        else:
            reply = "I understand you have a question. To give you the most accurate advice, could you please mention the medical condition (e.g., bypass surgery, kidney stones) or the city you are located in?\n\nIf you need emergency support, please click the emergency toggle immediately."
            suggested_actions = ["Search heart treatment", "Find nearby hospitals", "Emergency Support"]
            
    return {
        "reply": reply,
        "context_hospital_id": context_hospital_id,
        "suggested_actions": suggested_actions
    }
