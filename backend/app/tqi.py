from typing import List, Dict, Any
from sqlalchemy.orm import Session
from . import models

# Default weights as specified in the requirements
DEFAULT_WEIGHTS = {
    "Cardiology": {
        "w_specialist": 0.25,
        "w_infra": 0.20,
        "w_satisfaction": 0.15,
        "w_affordability": 0.10,
        "w_accreditation": 0.10,
        "w_emergency": 0.10,
        "w_outcome": 0.10
    },
    "Oncology": {
        "w_specialist": 0.30,
        "w_infra": 0.25,
        "w_satisfaction": 0.10,
        "w_affordability": 0.05,
        "w_accreditation": 0.15,
        "w_emergency": 0.05,
        "w_outcome": 0.10
    },
    "Urology": {
        "w_specialist": 0.20,
        "w_infra": 0.20,
        "w_satisfaction": 0.15,
        "w_affordability": 0.20,
        "w_accreditation": 0.10,
        "w_emergency": 0.05,
        "w_outcome": 0.10
    },
    "Default": {
        "w_specialist": 0.25,
        "w_infra": 0.20,
        "w_satisfaction": 0.15,
        "w_affordability": 0.10,
        "w_accreditation": 0.10,
        "w_emergency": 0.10,
        "w_outcome": 0.10
    }
}

def calculate_specialist_score(dept: models.Department, doctors: List[models.Doctor]) -> float:
    if not doctors:
        return 50.0
    
    # Filter doctors for this specific department
    dept_doctors = [d for d in doctors if d.specialty.lower() == dept.name.lower()]
    
    count = len(dept_doctors) or dept.specialist_count or 1
    avg_exp = sum(d.experience_years for d in dept_doctors) / len(dept_doctors) if dept_doctors else 8
    avg_tenure = sum(d.tenure_years for d in dept_doctors) / len(dept_doctors) if dept_doctors else 4
    
    # Cap components
    count_score = min(count * 15, 45) # 3+ specialists gives 45 pts
    exp_score = min(avg_exp * 4, 40)   # 10+ yrs exp gives 40 pts
    tenure_score = min(avg_tenure * 3.75, 15) # doctor stability (max 15 pts)
    
    return float(count_score + exp_score + tenure_score)

def calculate_infra_score(hospital: models.Hospital, dept: models.Department) -> float:
    # OT counts
    ot_score = min(hospital.ot_count * 10, 30) # 3 OTs max points
    # ICU beds
    icu_score = min(hospital.icu_beds * 2.5, 30) # 12 beds max points
    # General beds
    bed_score = min(hospital.total_beds * 0.1, 20) # 200 beds max points
    
    # Specialized equipment count
    equip_list = [e.strip() for e in dept.equipment.split(",") if e.strip()] if dept.equipment else []
    equip_score = min(len(equip_list) * 10, 20)
    
    return float(ot_score + icu_score + bed_score + equip_score)

def calculate_satisfaction_score(reviews: List[models.Review], dept_name: str) -> float:
    dept_reviews = [r for r in reviews if r.treatment.lower() == dept_name.lower()]
    if not dept_reviews:
        # If no department specific reviews, use general reviews
        dept_reviews = reviews
    
    if not dept_reviews:
        return 75.0 # default decent satisfaction score
        
    avg_sentiment = sum(r.sentiment_score for r in dept_reviews) / len(dept_reviews)
    return float(avg_sentiment)

def calculate_affordability_score(hospital: models.Hospital, dept: models.Department, db: Session) -> float:
    # Get all cost estimates for this department's treatments
    treatments = [t.strip() for t in dept.treatments_offered.split(",") if t.strip()] if dept.treatments_offered else []
    if not treatments:
        return 70.0
    
    # Find all cost estimates for the same treatments in the same city to get the average
    # We will compute the cost score relative to other hospitals in the city
    hospital_costs = db.query(models.CostEstimate).filter(
        models.CostEstimate.hospital_id == hospital.id,
        models.CostEstimate.treatment_name.in_(treatments)
    ).all()
    
    if not hospital_costs:
        return 70.0
        
    avg_hospital_cost = sum((c.cost_min + c.cost_max) / 2 for c in hospital_costs) / len(hospital_costs)
    
    # Calculate city average for the same treatments
    city_costs = db.query(models.CostEstimate).join(models.Hospital).filter(
        models.Hospital.city == hospital.city,
        models.CostEstimate.treatment_name.in_(treatments)
    ).all()
    
    if not city_costs or len(city_costs) <= 1:
        # Fallback to national/state default estimate or high default score
        return 80.0
        
    avg_city_cost = sum((c.cost_min + c.cost_max) / 2 for c in city_costs) / len(city_costs)
    
    ratio = avg_hospital_cost / avg_city_cost
    
    # Lower cost -> higher affordability score
    if ratio <= 0.8:
        return 100.0
    elif ratio >= 1.5:
        return 30.0
    else:
        # Linear interpolation between 0.8 (100 pts) and 1.5 (30 pts)
        return float(100.0 - ((ratio - 0.8) / 0.7) * 70.0)

def calculate_accreditation_score(accreditation_str: str) -> float:
    if not accreditation_str:
        return 50.0
    
    acc_list = [a.strip().upper() for a in accreditation_str.split(",") if a.strip()]
    
    if "JCI" in acc_list and "NABH" in acc_list:
        return 100.0
    elif "JCI" in acc_list:
        return 95.0
    elif "NABH" in acc_list:
        return 85.0
    elif "ISO" in acc_list:
        return 70.0
    return 60.0

def calculate_emergency_score(hospital: models.Hospital) -> float:
    if not hospital.emergency_available:
        return 30.0
    
    # Emergency capability depends on ICU beds and total beds
    if hospital.icu_beds >= 10:
        return 100.0
    elif hospital.icu_beds >= 5:
        return 85.0
    return 70.0

def calculate_outcome_score(acc_score: float, specialist_score: float) -> float:
    # Proxy using accreditation (quality standards) and specialist experience/stability
    return float(0.4 * acc_score + 0.6 * specialist_score)

def calculate_and_save_tqi(db: Session, hospital_id: int):
    """
    Computes TQI for all departments of a specific hospital and updates the cache in database.
    """
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hospital:
        return
        
    doctors = db.query(models.Doctor).filter(models.Doctor.hospital_id == hospital_id).all()
    reviews = db.query(models.Review).filter(models.Review.hospital_id == hospital_id).all()
    
    for dept in hospital.departments:
        # Get custom weights for this treatment category or use default
        weights_orm = db.query(models.TqiWeights).filter(models.TqiWeights.treatment_category == dept.name).first()
        if weights_orm:
            w = {
                "w_specialist": weights_orm.w_specialist,
                "w_infra": weights_orm.w_infra,
                "w_satisfaction": weights_orm.w_satisfaction,
                "w_affordability": weights_orm.w_affordability,
                "w_accreditation": weights_orm.w_accreditation,
                "w_emergency": weights_orm.w_emergency,
                "w_outcome": weights_orm.w_outcome
            }
        else:
            w = DEFAULT_WEIGHTS.get(dept.name, DEFAULT_WEIGHTS["Default"])
            
        # Calculate scores
        dept.tqi_specialist = calculate_specialist_score(dept, doctors)
        dept.tqi_infra = calculate_infra_score(hospital, dept)
        dept.tqi_satisfaction = calculate_satisfaction_score(reviews, dept.name)
        dept.tqi_affordability = calculate_affordability_score(hospital, dept, db)
        dept.tqi_accreditation = calculate_accreditation_score(hospital.accreditation)
        dept.tqi_emergency = calculate_emergency_score(hospital)
        dept.tqi_outcome = calculate_outcome_score(dept.tqi_accreditation, dept.tqi_specialist)
        
        # Weighted sum
        score = (
            w["w_specialist"] * dept.tqi_specialist +
            w["w_infra"] * dept.tqi_infra +
            w["w_satisfaction"] * dept.tqi_satisfaction +
            w["w_affordability"] * dept.tqi_affordability +
            w["w_accreditation"] * dept.tqi_accreditation +
            w["w_emergency"] * dept.tqi_emergency +
            w["w_outcome"] * dept.tqi_outcome
        )
        
        # Ensure it's normalized 0-100
        dept.tqi_score = round(max(0.0, min(100.0, score)), 1)
        
    db.commit()
