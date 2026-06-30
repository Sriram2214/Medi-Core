import math
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from . import models, schemas

# Center coordinates for Tamil Nadu districts to compute mock distance
CITY_CENTERS = {
    "ariyalur": (11.1401, 79.0789),
    "chengalpattu": (12.6841, 79.9836),
    "chennai": (13.0827, 80.2707),
    "coimbatore": (11.0168, 76.9558),
    "cuddalore": (11.7480, 79.7714),
    "dharmapuri": (12.1211, 78.1582),
    "dindigul": (10.3673, 77.9803),
    "erode": (11.3410, 77.7172),
    "kallakurichi": (11.7383, 78.9639),
    "kanchipuram": (12.8387, 79.7016),
    "kanyakumari": (8.1833, 77.4119),
    "karur": (10.9599, 78.0766),
    "krishnagiri": (12.5186, 78.2137),
    "madurai": (9.9252, 78.1198),
    "mayiladuthurai": (11.1018, 79.6522),
    "nagapattinam": (10.7656, 79.8424),
    "namakkal": (11.2189, 78.1674),
    "nilgiris": (11.4102, 76.6950),
    "perambalur": (11.2342, 78.8821),
    "pudukkottai": (10.3797, 78.8208),
    "ramanathapuram": (9.3639, 78.8394),
    "ranipet": (12.9272, 79.3328),
    "salem": (11.6643, 78.1460),
    "sivaganga": (9.8433, 78.4809),
    "tenkasi": (8.9591, 77.3148),
    "thanjavur": (10.7870, 79.1378),
    "theni": (10.0104, 77.4768),
    "thoothukudi": (8.7642, 78.1348),
    "tiruchirappalli": (10.7905, 78.7047),
    "tirunelveli": (8.7139, 77.7567),
    "tirupathur": (12.4934, 78.5678),
    "tiruppur": (11.1085, 77.3411),
    "tiruvallur": (13.1438, 79.9079),
    "tiruvannamalai": (12.2253, 79.0747),
    "tiruvarur": (10.7725, 79.6360),
    "vellore": (12.9165, 79.1325),
    "viluppuram": (11.9401, 79.4861),
    "virudhunagar": (9.5680, 77.9624)
}

# English/Hindi/Hinglish condition translator mapping
CONDITION_MAP = {
    "cardiology": [
        "heart", "cardiac", "bypass", "angioplasty", "dil", "chest pain", "blockage", 
        "heart attack", "stroke", "ecg", "chest", "dhadkan", "valve", "pacemaker", 
        "artery", "cardio", "dil ka dard", "chhati dard"
    ],
    "oncology": [
        "cancer", "tumor", "chemo", "radiation", "oncology", "malignant", "biopsy", 
        "gath", "cancer treatment", "blood cancer", "chemotherapy"
    ],
    "orthopedics": [
        "bone", "joint", "knee", "spine", "fracture", "ortho", "haddi", "replacement", 
        "toot", "back pain", "guthna", "arthroplasty", "ligament", "hip pain", "haddi doctor"
    ],
    "urology": [
        "stone", "kidney stone", "urology", "prostate", "urine", "pathri", "lithotripsy", 
        "bladder", "peshab", "kidney stone removal", "stone operation"
    ],
    "gynecology": [
        "pregnancy", "delivery", "gynecology", "baby", "womens health", "c-section", 
        "childbirth", "bacha", "mahila", "periods", "maternity", "delivery cost", "deliver"
    ],
    "nephrology": [
        "kidney", "dialysis", "nephro", "kidney failure", "guarda", "renal", "kidney transplant"
    ],
    "neurology": [
        "brain", "neuro", "paralysis", "migraine", "fits", "seizure", "spinal cord", 
        "dimag", "nerves", "paralyse", "headache"
    ],
    "pediatrics": [
        "child", "pediatric", "vaccination", "infant", "bacha doctor", "neonatal", "pediatrics",
        "kids doctor", "child health"
    ]
}

def translate_condition(query: str) -> str:
    """
    Translates a plain-text/Hindi/Hinglish symptom or disease name
    to a clinical treatment category. Defaults to 'General Medicine'.
    """
    if not query:
        return "General Medicine"
    
    query_lower = query.lower().strip()
    
    # Check exact match first
    for category, keywords in CONDITION_MAP.items():
        if query_lower == category:
            return category.capitalize()
            
    # Check substring matches for keywords
    for category, keywords in CONDITION_MAP.items():
        for keyword in keywords:
            if keyword in query_lower:
                return category.capitalize()
                
    return "General Medicine"

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Haversine distance between two coordinates in kilometers."""
    R = 6371.0 # Earth radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 1)

def get_recommendations(db: Session, req: schemas.SearchRequest) -> schemas.SearchResponse:
    # 1. Translate disease/condition to treatment category
    category = translate_condition(req.condition)
    
    # 2. Get city reference coords
    city_lower = req.city.lower().strip()
    user_coords = CITY_CENTERS.get(city_lower, (13.0827, 80.2707)) # fallback to Chennai
    
    # 3. Query hospitals in the target city
    hospitals = db.query(models.Hospital).filter(
        models.Hospital.city.ilike(city_lower)
    ).all()
    
    results = []
    
    for hosp in hospitals:
        # Check if the hospital has the required department
        # For 'General Medicine', we can proceed even if there is no explicit dept, using defaults
        dept = None
        for d in hosp.departments:
            if d.name.lower() == category.lower():
                dept = d
                break
                
        if not dept and category != "General Medicine":
            # If not General Medicine, hospital must have the department
            continue
            
        # Get/calculate cost estimates for this category/treatment
        cost_estimates = [c for c in hosp.cost_estimates if c.treatment_name.lower() in [category.lower(), req.condition.lower()]]
        if not cost_estimates and hosp.cost_estimates:
            # Fallback to any cost estimate or general
            cost_estimates = [c for c in hosp.cost_estimates if category.lower() in c.treatment_name.lower()]
            
        est_min, est_max = None, None
        if cost_estimates:
            est_min = min(c.cost_min for c in cost_estimates)
            est_max = max(c.cost_max for c in cost_estimates)
            
        # Budget filter
        if req.budget and est_min and est_min > req.budget:
            # Skip if minimum cost is greater than patient's budget
            continue
            
        # Insurance match score
        insurance_match = "Out of Network"
        if req.insurance_provider:
            ins_panels = [i.strip().lower() for i in hosp.insurance_panels.split(",") if i.strip()] if hosp.insurance_panels else []
            user_ins = req.insurance_provider.strip().lower()
            
            # Simple check or partial match
            if any(user_ins in panel or panel in user_ins for panel in ins_panels):
                insurance_match = "Fully Covered"
            elif len(ins_panels) > 0:
                insurance_match = "Partially Covered"
        else:
            insurance_match = "N/A"
            
        # Proximity
        distance = calculate_haversine(user_coords[0], user_coords[1], hosp.lat, hosp.lng)
        
        # Calculate proximity score (0-100)
        # Under 2km = 100, above 15km = 20
        if distance <= 2.0:
            prox_score = 100.0
        elif distance >= 15.0:
            prox_score = 20.0
        else:
            prox_score = 100.0 - ((distance - 2.0) / 13.0) * 80.0
            
        # Get TQI scores
        tqi_val = 70.0
        tqi_breakdown = {
            "specialist": 70.0, "infra": 70.0, "satisfaction": 70.0, 
            "affordability": 70.0, "accreditation": 70.0, "emergency": 70.0, "outcome": 70.0
        }
        
        if dept:
            tqi_val = dept.tqi_score
            tqi_breakdown = {
                "specialist": dept.tqi_specialist,
                "infra": dept.tqi_infra,
                "satisfaction": dept.tqi_satisfaction,
                "affordability": dept.tqi_affordability,
                "accreditation": dept.tqi_accreditation,
                "emergency": dept.tqi_emergency,
                "outcome": dept.tqi_outcome
            }
            
        # Recommendation Score based on priority
        priority_lower = req.priority.lower()
        if priority_lower == "affordability":
            # High weight on affordability score and cost
            aff_score = tqi_breakdown["affordability"]
            rec_score = (tqi_val * 0.25) + (prox_score * 0.15) + (aff_score * 0.60)
        elif priority_lower == "proximity":
            rec_score = (tqi_val * 0.15) + (prox_score * 0.70) + (tqi_breakdown["affordability"] * 0.15)
        elif priority_lower == "emergency":
            rec_score = (tqi_val * 0.20) + (prox_score * 0.30) + (tqi_breakdown["emergency"] * 0.50)
        else: # quality (default)
            rec_score = (tqi_val * 0.65) + (prox_score * 0.20) + (tqi_breakdown["affordability"] * 0.15)
            
        # Explainability Generator
        explanation = []
        explanation.append(f"TQI Score is {tqi_val}/100 for {category} care")
        
        acc_list = [a.strip() for a in hosp.accreditation.split(",") if a.strip()] if hosp.accreditation else []
        if acc_list:
            explanation.append(f"Accredited by: {', '.join(acc_list)}")
            
        if dept and dept.specialist_count > 0:
            explanation.append(f"Features a specialized team of {dept.specialist_count} doctors for this treatment")
            
        if est_min and est_max:
            explanation.append(f"Estimated treatment cost: ₹{est_min:,} - ₹{est_max:,}")
            if req.budget and est_max <= req.budget:
                explanation.append(f"Fits fully within your budget limit of ₹{req.budget:,}")
                
        explanation.append(f"Located {distance} km away from search center")
        
        if hosp.emergency_available:
            explanation.append("Equipped with 24x7 emergency trauma center and active ICU beds")
            
        if insurance_match == "Fully Covered":
            explanation.append(f"Partnered hospital: Fully covered under your {req.insurance_provider} insurance")
        elif insurance_match == "Partially Covered":
            explanation.append(f"Out-of-network but supports insurance panel claims")
            
        results.append(schemas.SearchResponseItem(
            hospital_id=hosp.id,
            hospital_name=hosp.name,
            city=hosp.city,
            type=hosp.type,
            distance_km=distance,
            estimated_cost_min=est_min,
            estimated_cost_max=est_max,
            insurance_coverage=insurance_match,
            tqi_score=tqi_val,
            tqi_breakdown=schemas.TqiBreakdown(**tqi_breakdown),
            explanation=explanation,
            accreditations=acc_list,
            emergency_available=hosp.emergency_available
        ))
        
    # Sort results by recommendation score descending
    # In Emergency Priority, filter to show only emergency-ready first, then sorting
    if req.priority.lower() == "emergency":
        # Force hospitals with emergency first
        results.sort(key=lambda x: (x.emergency_available, x.tqi_score), reverse=True)
    else:
        results.sort(key=lambda x: x.tqi_score, reverse=True)
        
    # Log the search in DB
    log = models.SearchLog(
        query=req.condition,
        mapped_category=category,
        city=req.city,
        priority=req.priority,
        results_count=len(results)
    )
    db.add(log)
    db.commit()
    
    return schemas.SearchResponse(
        mapped_category=category,
        results=results
    )
