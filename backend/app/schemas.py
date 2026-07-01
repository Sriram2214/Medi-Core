from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

# Doctor Schemas
class DoctorBase(BaseModel):
    name: str
    specialty: str
    qualification: str
    experience_years: int
    languages: str
    tenure_years: int

class DoctorCreate(DoctorBase):
    pass

class DoctorResponse(DoctorBase):
    id: int
    hospital_id: int

    class Config:
        from_attributes = True


# Cost Estimate Schemas
class CostEstimateBase(BaseModel):
    treatment_name: str
    cost_min: int
    cost_max: int
    currency: str = "INR"

class CostEstimateCreate(CostEstimateBase):
    pass

class CostEstimateResponse(CostEstimateBase):
    id: int
    hospital_id: int

    class Config:
        from_attributes = True


# Review Schemas
class ReviewBase(BaseModel):
    rating: int
    text: str
    treatment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    hospital_id: int
    date: datetime
    sentiment_score: float
    verified: bool

    class Config:
        from_attributes = True


# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    head_doctor: str
    specialist_count: int
    treatments_offered: str
    equipment: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    hospital_id: int
    tqi_score: float
    tqi_specialist: float
    tqi_infra: float
    tqi_satisfaction: float
    tqi_affordability: float
    tqi_accreditation: float
    tqi_emergency: float
    tqi_outcome: float

    class Config:
        from_attributes = True


# Hospital Schemas
class HospitalBase(BaseModel):
    name: str
    type: str
    address: str
    city: str
    state: str
    lat: float
    lng: float
    phone: str
    email: str
    website: str
    operating_hours: str
    emergency_available: bool
    accreditation: str
    insurance_panels: str
    total_beds: int
    icu_beds: int
    ot_count: int
    verified: bool

class HospitalCreate(HospitalBase):
    pass

class HospitalBriefResponse(HospitalBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class HospitalResponse(HospitalBase):
    id: int
    last_updated: datetime
    departments: List[DepartmentResponse] = []
    doctors: List[DoctorResponse] = []
    cost_estimates: List[CostEstimateResponse] = []
    reviews: List[ReviewResponse] = []

    class Config:
        from_attributes = True


# TQI Weights Schemas
class TqiWeightsBase(BaseModel):
    w_specialist: float = Field(..., ge=0.0, le=1.0)
    w_infra: float = Field(..., ge=0.0, le=1.0)
    w_satisfaction: float = Field(..., ge=0.0, le=1.0)
    w_affordability: float = Field(..., ge=0.0, le=1.0)
    w_accreditation: float = Field(..., ge=0.0, le=1.0)
    w_emergency: float = Field(..., ge=0.0, le=1.0)
    w_outcome: float = Field(..., ge=0.0, le=1.0)

class TqiWeightsResponse(TqiWeightsBase):
    id: int
    treatment_category: str

    class Config:
        from_attributes = True


# Recommendation & Search Schemas
class SearchRequest(BaseModel):
    condition: str
    city: str
    budget: Optional[int] = None
    insurance_provider: Optional[str] = None
    priority: str = "quality" # quality, affordability, proximity, emergency
    age_group: str = "adult" # child, adult, elderly
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    max_distance_km: Optional[float] = None

class TqiBreakdown(BaseModel):
    specialist: float
    infra: float
    satisfaction: float
    affordability: float
    accreditation: float
    emergency: float
    outcome: float

class SearchResponseItem(BaseModel):
    hospital_id: int
    hospital_name: str
    city: str
    type: str
    distance_km: float
    estimated_cost_min: Optional[int] = None
    estimated_cost_max: Optional[int] = None
    insurance_coverage: str # Fully Covered, Partially Covered, Out of Network
    tqi_score: float
    tqi_breakdown: TqiBreakdown
    explanation: List[str]
    accreditations: List[str]
    emergency_available: bool

class SearchResponse(BaseModel):
    mapped_category: str
    results: List[SearchResponseItem]


# Chatbot Schemas
class ChatRequest(BaseModel):
    message: str
    hospital_id: Optional[int] = None # Current context hospital if any
    chat_history: List[Dict[str, str]] = [] # [{"sender": "user", "text": "..."}, ...]

class ChatResponse(BaseModel):
    reply: str
    context_hospital_id: Optional[int] = None
    suggested_actions: List[str] = []


# Analytics Schema
class AnalyticsResponse(BaseModel):
    total_hospitals: int
    searches_count: int
    average_tqi: float
    top_searches: List[Dict[str, int]]
    city_distribution: Dict[str, int]
    treatment_costs: List[Dict[str, float]]


# Geo-Spatial Location Radar Schemas
class NearbyRequest(BaseModel):
    lat: float
    lng: float
    radius_km: float = 15.0
    category_filter: Optional[str] = "all" # all, hospital, scan, lab, pharmacy

class NearbyFacilityResponseItem(BaseModel):
    id: str
    name: str
    category: str # "Hospital", "Scan Centre", "Diagnostic Lab", "Pharmacy"
    type: str
    city: str
    address: str
    phone: str
    website: Optional[str] = None
    distance_km: float
    lat: float
    lng: float
    emergency_available: bool = False
    travel_time_car_mins: int = 5
    travel_time_bike_mins: int = 3
    google_maps_url: str = ""
    google_directions_url: str = ""

class NearbyResponse(BaseModel):
    total_found: int
    user_lat: float
    user_lng: float
    radius_km: float
    facilities: List[NearbyFacilityResponseItem]

