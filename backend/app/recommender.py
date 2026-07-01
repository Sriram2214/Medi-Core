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
    
    # 2. Get city reference coords or user coordinates if provided
    city_lower = req.city.lower().strip()
    if req.user_lat is not None and req.user_lng is not None:
        user_coords = (req.user_lat, req.user_lng)
        all_hospitals = db.query(models.Hospital).all()
        max_dist = req.max_distance_km or 50.0
        hospitals = [h for h in all_hospitals if calculate_haversine(user_coords[0], user_coords[1], h.lat, h.lng) <= max_dist]
        if not hospitals:
            hospitals = db.query(models.Hospital).filter(models.Hospital.city.ilike(city_lower)).all()
    else:
        user_coords = CITY_CENTERS.get(city_lower, (13.0827, 80.2707)) # fallback to Chennai
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


# Extra Facilities (Scan Centres, Diagnostic Labs, Pharmacies) indexed with geo-coordinates
EXTRA_FACILITIES = [
    # Perambalur Scan Centres (around 11.2342, 78.8821)
    {"id": "scan-1", "name": "KYPROS Scan Centre", "category": "Scan Centre", "type": "Private", "city": "Perambalur", "address": "Four Roads, Perambalur", "phone": "04328-220011", "website": "https://kyprosscan.com", "lat": 11.2355, "lng": 78.8835},
    {"id": "scan-2", "name": "Medall Diagnostics", "category": "Scan Centre", "type": "Private", "city": "Perambalur", "address": "Elambalur Road, Perambalur", "phone": "04328-220022", "website": "https://www.medall.in", "lat": 11.2320, "lng": 78.8810},
    {"id": "scan-3", "name": "Perambalur Scan Centre", "category": "Scan Centre", "type": "Private", "city": "Perambalur", "address": "Old Bus Stand, Perambalur", "phone": "04328-220033", "website": None, "lat": 11.2348, "lng": 78.8850},
    {"id": "scan-4", "name": "Pixel Scans", "category": "Scan Centre", "type": "Private", "city": "Perambalur", "address": "Trichy Bypass, Perambalur", "phone": "04328-220044", "website": None, "lat": 11.2310, "lng": 78.8800},
    # Perambalur Labs
    {"id": "lab-1", "name": "Sri Sai Diagnostics", "category": "Diagnostic Lab", "type": "Private", "city": "Perambalur", "address": "Thuraimangalam, Perambalur", "phone": "04328-221155", "website": "https://srisaidiagnostics.com", "lat": 11.2360, "lng": 78.8840},
    {"id": "lab-2", "name": "Raja Hitech Diagnostic Lab", "category": "Diagnostic Lab", "type": "Private", "city": "Perambalur", "address": "MG Road, Perambalur", "phone": "04328-221166", "website": None, "lat": 11.2330, "lng": 78.8825},
    # Perambalur Pharmacies
    {"id": "pharm-1", "name": "MedPlus Pharmacy", "category": "Pharmacy", "type": "Private", "city": "Perambalur", "address": "Four Roads Junction, Perambalur", "phone": "04328-222211", "website": "https://www.medplusmart.com", "lat": 11.2345, "lng": 78.8815},
    {"id": "pharm-2", "name": "Thulasi Pharmacy", "category": "Pharmacy", "type": "Private", "city": "Perambalur", "address": "New MG Road, Perambalur", "phone": "04328-222222", "website": None, "lat": 11.2350, "lng": 78.8830},
    {"id": "pharm-3", "name": "Bawa Medicals", "category": "Pharmacy", "type": "Private", "city": "Perambalur", "address": "GH Road, Perambalur", "phone": "04328-222233", "website": None, "lat": 11.2335, "lng": 78.8845},
    {"id": "pharm-4", "name": "Bharath Medical", "category": "Pharmacy", "type": "Private", "city": "Perambalur", "address": "Old Bus Stand Road, Perambalur", "phone": "04328-222244", "website": None, "lat": 11.2325, "lng": 78.8805},
    
    # Chennai sample scan/labs/pharmacies (around 13.0827, 80.2707)
    {"id": "chn-scan-1", "name": "Aarti Scans & Labs", "category": "Scan Centre", "type": "Private", "city": "Chennai", "address": "Vadapalani, Chennai", "phone": "044-24732222", "website": "https://aartiscans.com", "lat": 13.0500, "lng": 80.2120},
    {"id": "chn-lab-1", "name": "Metropolis Healthcare Lab", "category": "Diagnostic Lab", "type": "Private", "city": "Chennai", "address": "T. Nagar, Chennai", "phone": "044-42000000", "website": "https://www.metropolisindia.com", "lat": 13.0400, "lng": 80.2330},
    {"id": "chn-pharm-1", "name": "Apollo Pharmacy 24/7", "category": "Pharmacy", "type": "Private", "city": "Chennai", "address": "Greams Road, Chennai", "phone": "044-28291111", "website": "https://www.apollopharmacy.in", "lat": 13.0600, "lng": 80.2500},
    
    # Coimbatore sample scan/labs/pharmacies (around 11.0168, 76.9558)
    {"id": "cbe-scan-1", "name": "KG Advanced Scan Centre", "category": "Scan Centre", "type": "Private", "city": "Coimbatore", "address": "Arts College Rd, Coimbatore", "phone": "0422-2212121", "website": None, "lat": 11.0180, "lng": 76.9580},
    {"id": "cbe-pharm-1", "name": "Thulasi Pharmacy Coimbatore", "category": "Pharmacy", "type": "Private", "city": "Coimbatore", "address": "RS Puram, Coimbatore", "phone": "0422-2550000", "website": None, "lat": 11.0100, "lng": 76.9500},
    
    # Salem & Madurai sample scan/labs/pharmacies
    {"id": "slm-scan-1", "name": "Salem Diagnostic Scan Lab", "category": "Scan Centre", "type": "Private", "city": "Salem", "address": "Fairlands, Salem", "phone": "0427-2440000", "website": None, "lat": 11.6680, "lng": 78.1490},
    {"id": "mdu-lab-1", "name": "Bose Diagnostic Lab Madurai", "category": "Diagnostic Lab", "type": "Private", "city": "Madurai", "address": "KK Nagar, Madurai", "phone": "0452-2530000", "website": None, "lat": 9.9300, "lng": 78.1250}
]

def get_nearby_facilities(db: Session, req: schemas.NearbyRequest) -> schemas.NearbyResponse:
    facilities = []
    cat_filter = (req.category_filter or "all").lower()
    
    # 1. Search Hospitals from SQLite DB
    if cat_filter in ["all", "hospital", "hospitals"]:
        all_hosps = db.query(models.Hospital).all()
        for h in all_hosps:
            dist = calculate_haversine(req.lat, req.lng, h.lat, h.lng)
            if dist <= req.radius_km:
                car_time = max(1, int(round(dist * 2.2 + 2)))
                bike_time = max(1, int(round(dist * 1.7 + 1)))
                maps_url = f"https://www.google.com/maps/search/?api=1&query={h.lat},{h.lng}"
                dir_url = f"https://www.google.com/maps/dir/?api=1&origin={req.lat},{req.lng}&destination={h.lat},{h.lng}"
                
                facilities.append(schemas.NearbyFacilityResponseItem(
                    id=f"hosp-{h.id}",
                    name=h.name,
                    category="Hospital",
                    type=h.type.capitalize(),
                    city=h.city,
                    address=h.address,
                    phone=h.phone or "044-20000000",
                    website=h.website,
                    distance_km=dist,
                    lat=h.lat,
                    lng=h.lng,
                    emergency_available=h.emergency_available,
                    travel_time_car_mins=car_time,
                    travel_time_bike_mins=bike_time,
                    google_maps_url=maps_url,
                    google_directions_url=dir_url
                ))
                
    # 2. Search Extra Facilities (Scan Centres, Diagnostic Labs, Pharmacies)
    for f in EXTRA_FACILITIES:
        if cat_filter != "all" and cat_filter not in f["category"].lower():
            continue
        dist = calculate_haversine(req.lat, req.lng, f["lat"], f["lng"])
        if dist <= req.radius_km:
            car_time = max(1, int(round(dist * 2.2 + 2)))
            bike_time = max(1, int(round(dist * 1.7 + 1)))
            maps_url = f"https://www.google.com/maps/search/?api=1&query={f['lat']},{f['lng']}"
            dir_url = f"https://www.google.com/maps/dir/?api=1&origin={req.lat},{req.lng}&destination={f['lat']},{f['lng']}"
            
            facilities.append(schemas.NearbyFacilityResponseItem(
                id=f["id"],
                name=f["name"],
                category=f["category"],
                type=f["type"],
                city=f["city"],
                address=f["address"],
                phone=f["phone"],
                website=f["website"],
                distance_km=dist,
                lat=f["lat"],
                lng=f["lng"],
                emergency_available=False,
                travel_time_car_mins=car_time,
                travel_time_bike_mins=bike_time,
                google_maps_url=maps_url,
                google_directions_url=dir_url
            ))
            
    # Sort all matching facilities by distance ascending (closest first)
    facilities.sort(key=lambda x: x.distance_km)
    
    return schemas.NearbyResponse(
        total_found=len(facilities),
        user_lat=req.lat,
        user_lng=req.lng,
        radius_km=req.radius_km,
        facilities=facilities
    )


