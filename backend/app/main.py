from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import datetime

from . import models, schemas, database, seed_data, tqi, recommender, chatbot, sentiment
from .database import engine, get_db

# Create DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediGuide AI API",
    description="Intelligent Hospital Recommendation & Healthcare Awareness Platform API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to React domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Automate database seeding on startup
    db = next(database.get_db())
    try:
        seed_data.seed_database(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "MediGuide AI Backend API",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# 1. Search / Recommend Hospital Endpoint
@app.post("/api/recommend", response_model=schemas.SearchResponse)
def get_hospital_recommendations(req: schemas.SearchRequest, db: Session = Depends(get_db)):
    try:
        return recommender.get_recommendations(db, req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation Engine error: {str(e)}"
        )

# 2. List All/Filtered Hospitals
@app.get("/api/hospitals", response_model=List[schemas.HospitalBriefResponse])
def get_hospitals(city: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Hospital)
    if city:
        query = query.filter(models.Hospital.city.ilike(city))
    return query.all()

# 3. Hospital Detailed Profile Endpoint
@app.get("/api/hospitals/{hospital_id}", response_model=schemas.HospitalResponse)
def get_hospital_profile(hospital_id: int, db: Session = Depends(get_db)):
    hosp = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with ID {hospital_id} not found."
        )
    return hosp

# 4. Hospital Side-by-Side Comparison Endpoint
@app.get("/api/compare", response_model=List[schemas.HospitalResponse])
def compare_hospitals(ids: str = Query(..., description="Comma-separated hospital IDs"), db: Session = Depends(get_db)):
    try:
        id_list = [int(i.strip()) for i in ids.split(",") if i.strip()]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hospital IDs must be a list of integers."
        )
        
    if not id_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one hospital ID must be provided."
        )
        
    if len(id_list) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comparison is capped at maximum 3 hospitals."
        )
        
    hospitals = db.query(models.Hospital).filter(models.Hospital.id.in_(id_list)).all()
    
    # Sort to match request order
    id_map = {h.id: h for h in hospitals}
    ordered_hospitals = [id_map[i] for i in id_list if i in id_map]
    
    return ordered_hospitals

# 5. Submit Review (Auto-run Sentiment Analysis & Recalculate TQI)
@app.post("/api/hospitals/{hospital_id}/reviews", response_model=schemas.ReviewResponse)
def submit_hospital_review(hospital_id: int, review_in: schemas.ReviewCreate, db: Session = Depends(get_db)):
    hosp = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found.")
        
    # Check if department exists
    dept_names = [d.name.lower() for d in hosp.departments]
    if review_in.treatment.lower() not in dept_names and review_in.treatment.lower() != "general medicine":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Treatment category must be one of hospital's departments: {', '.join(d.name for d in hosp.departments)}"
        )
        
    # Analyze text sentiment
    sent_score = sentiment.analyze_review_sentiment(review_in.text, review_in.rating)
    
    db_review = models.Review(
        hospital_id=hospital_id,
        rating=review_in.rating,
        text=review_in.text,
        treatment=review_in.treatment,
        sentiment_score=sent_score,
        verified=True,
        date=datetime.datetime.utcnow()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Trigger dynamic TQI score recalculation
    tqi.calculate_and_save_tqi(db, hospital_id)
    
    return db_review

# 6. Chatbot Assistant Endpoint
@app.post("/api/chat", response_model=schemas.ChatResponse)
def chat_with_assistant(req: schemas.ChatRequest, db: Session = Depends(get_db)):
    try:
        res = chatbot.parse_chatbot_message(db, req.message, req.hospital_id)
        return schemas.ChatResponse(
            reply=res["reply"],
            context_hospital_id=res["context_hospital_id"],
            suggested_actions=res["suggested_actions"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot Engine error: {str(e)}"
        )

# 7. Admin Panel Endpoints
@app.get("/api/admin/weights", response_model=List[schemas.TqiWeightsResponse])
def get_tqi_weights(db: Session = Depends(get_db)):
    return db.query(models.TqiWeights).all()

@app.post("/api/admin/weights", response_model=schemas.TqiWeightsResponse)
def update_tqi_weights(req: schemas.TqiWeightsBase, category: str = Query(..., description="Category like Cardiology or Default"), db: Session = Depends(get_db)):
    weight_orm = db.query(models.TqiWeights).filter(models.TqiWeights.treatment_category == category).first()
    if not weight_orm:
        weight_orm = models.TqiWeights(treatment_category=category)
        db.add(weight_orm)
        
    weight_orm.w_specialist = req.w_specialist
    weight_orm.w_infra = req.w_infra
    weight_orm.w_satisfaction = req.w_satisfaction
    weight_orm.w_affordability = req.w_affordability
    weight_orm.w_accreditation = req.w_accreditation
    weight_orm.w_emergency = req.w_emergency
    weight_orm.w_outcome = req.w_outcome
    
    db.commit()
    db.refresh(weight_orm)
    
    # Recalculate TQI for ALL hospitals because weights changed
    hospitals = db.query(models.Hospital).all()
    for h in hospitals:
        tqi.calculate_and_save_tqi(db, h.id)
        
    return weight_orm

@app.get("/api/admin/analytics", response_model=schemas.AnalyticsResponse)
def get_admin_analytics(db: Session = Depends(get_db)):
    total_hosp = db.query(models.Hospital).count()
    searches_count = db.query(models.SearchLog).count()
    
    # Average TQI
    depts = db.query(models.Department).all()
    avg_tqi = sum(d.tqi_score for d in depts) / len(depts) if depts else 0.0
    
    # Top Search Queries
    search_logs = db.query(models.SearchLog).all()
    query_counts = {}
    for log in search_logs:
        query_counts[log.mapped_category] = query_counts.get(log.mapped_category, 0) + 1
    top_searches = [{"query": k, "count": v} for k, v in sorted(query_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # City distribution
    city_counts = {}
    hospitals = db.query(models.Hospital).all()
    for h in hospitals:
        city_counts[h.city] = city_counts.get(h.city, 0) + 1
        
    # Cost estimates averages by treatment
    costs = db.query(models.CostEstimate).all()
    cost_sums = {}
    cost_counts = {}
    for c in costs:
        mid_cost = (c.cost_min + c.cost_max) / 2
        cost_sums[c.treatment_name] = cost_sums.get(c.treatment_name, 0.0) + mid_cost
        cost_counts[c.treatment_name] = cost_counts.get(c.treatment_name, 0) + 1
        
    treatment_costs = [{"treatment": k, "avg_cost": round(v / cost_counts[k], 2)} for k, v in cost_sums.items() if cost_counts[k] > 0]
    
    return schemas.AnalyticsResponse(
        total_hospitals=total_hosp,
        searches_count=searches_count,
        average_tqi=round(avg_tqi, 1),
        top_searches=top_searches,
        city_distribution=city_counts,
        treatment_costs=treatment_costs
    )

@app.put("/api/admin/hospitals/{hospital_id}", response_model=schemas.HospitalResponse)
def update_hospital_data(hospital_id: int, req: schemas.HospitalCreate, db: Session = Depends(get_db)):
    hosp = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found.")
        
    # Update fields
    for field, val in req.model_dump().items():
        setattr(hosp, field, val)
        
    hosp.last_updated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(hosp)
    
    # Recalculate TQI
    tqi.calculate_and_save_tqi(db, hospital_id)
    
    return hosp
