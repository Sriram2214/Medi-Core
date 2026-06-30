from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # govt, private, trust
    address = Column(String)
    city = Column(String, index=True)
    state = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    operating_hours = Column(String, default="24x7")
    emergency_available = Column(Boolean, default=True)
    accreditation = Column(String) # Comma-separated, e.g., "NABH,JCI"
    insurance_panels = Column(String) # Comma-separated, e.g., "Star Health,HDFC ERGO"
    total_beds = Column(Integer, default=50)
    icu_beds = Column(Integer, default=10)
    ot_count = Column(Integer, default=2)
    verified = Column(Boolean, default=True)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    departments = relationship("Department", back_populates="hospital", cascade="all, delete-orphan")
    doctors = relationship("Doctor", back_populates="hospital", cascade="all, delete-orphan")
    cost_estimates = relationship("CostEstimate", back_populates="hospital", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="hospital", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    name = Column(String, index=True) # Cardiology, Oncology, Orthopedics, Neurology, Pediatrics, Gynecology, Nephrology, etc.
    head_doctor = Column(String)
    specialist_count = Column(Integer, default=1)
    treatments_offered = Column(String) # Comma-separated list, e.g., "Bypass Surgery,Angioplasty"
    equipment = Column(String) # Comma-separated list, e.g., "Cath Lab,MRI"
    
    # TQI cache variables
    tqi_score = Column(Float, default=0.0)
    tqi_specialist = Column(Float, default=0.0)
    tqi_infra = Column(Float, default=0.0)
    tqi_satisfaction = Column(Float, default=0.0)
    tqi_affordability = Column(Float, default=0.0)
    tqi_accreditation = Column(Float, default=0.0)
    tqi_emergency = Column(Float, default=0.0)
    tqi_outcome = Column(Float, default=0.0)

    hospital = relationship("Hospital", back_populates="departments")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    name = Column(String)
    specialty = Column(String, index=True) # Cardiology, Orthopedics, etc.
    qualification = Column(String)
    experience_years = Column(Integer, default=5)
    languages = Column(String, default="English,Hindi") # Comma-separated
    tenure_years = Column(Integer, default=3) # Doctor Stability Score metric

    hospital = relationship("Hospital", back_populates="doctors")


class CostEstimate(Base):
    __tablename__ = "cost_estimates"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    treatment_name = Column(String, index=True) # e.g., "Bypass Surgery", "Kidney Stone Removal"
    cost_min = Column(Integer)
    cost_max = Column(Integer)
    currency = Column(String, default="INR")

    hospital = relationship("Hospital", back_populates="cost_estimates")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"))
    rating = Column(Integer, default=5)
    text = Column(Text)
    treatment = Column(String) # e.g. Cardiology
    date = Column(DateTime, default=datetime.datetime.utcnow)
    sentiment_score = Column(Float, default=50.0) # Scale 0 - 100
    verified = Column(Boolean, default=True)

    hospital = relationship("Hospital", back_populates="reviews")


class TqiWeights(Base):
    __tablename__ = "tqi_weights"

    id = Column(Integer, primary_key=True, index=True)
    treatment_category = Column(String, unique=True, index=True) # Cardiology, etc., or "Default"
    w_specialist = Column(Float, default=0.25)
    w_infra = Column(Float, default=0.20)
    w_satisfaction = Column(Float, default=0.15)
    w_affordability = Column(Float, default=0.10)
    w_accreditation = Column(Float, default=0.10)
    w_emergency = Column(Float, default=0.10)
    w_outcome = Column(Float, default=0.10)


class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String)
    mapped_category = Column(String)
    city = Column(String)
    priority = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    results_count = Column(Integer)
