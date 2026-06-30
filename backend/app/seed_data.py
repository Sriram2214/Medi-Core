import random
import datetime
from sqlalchemy.orm import Session
from . import models, tqi, sentiment

# Center coordinates for all 38 Tamil Nadu districts to compute mock distances
CITIES_DATA = {
    "Ariyalur": {
        "hospitals": [
            ("Govt Headquarter Hospital Ariyalur", "govt", "Sendurai Road", "04329-228300", "Sendurai Rd"),
            ("Sugam Hospital Ariyalur", "private", "Trichy Road", "04329-221234", "Trichy Rd")
        ],
        "coords": (11.1401, 79.0789)
    },
    "Chengalpattu": {
        "hospitals": [
            ("Chengalpattu Govt Hospital", "govt", "GST Road", "044-27422222", "GST Road"),
            ("SRM Medical College Hospital", "private", "Potheri", "044-47432000", "Potheri")
        ],
        "coords": (12.6841, 79.9836)
    },
    "Chennai": {
        "hospitals": [
            ("Apollo Hospitals Greams Road", "private", "Greams Rd, Thousand Lights", "044-28290200", "Greams Rd"),
            ("Fortis Malar Hospital", "private", "Adyar, Gandhi Nagar", "044-24914023", "Adyar"),
            ("MIOT International", "private", "Manapakkam", "044-42002288", "Manapakkam"),
            ("Stanley Medical College Hospital", "govt", "Old Washermanpet", "044-25281351", "Old Washermanpet"),
            ("Rajiv Gandhi Govt General Hospital", "govt", "Park Town", "044-25305000", "Park Town")
        ],
        "coords": (13.0827, 80.2707)
    },
    "Coimbatore": {
        "hospitals": [
            ("PSG Hospitals", "trust", "Peelamedu", "0422-2570170", "Peelamedu"),
            ("KG Hospital", "private", "Arts College Road", "0422-2212121", "Arts College Rd"),
            ("Kovai Medical Center and Hospital", "private", "Avinashi Road", "0422-4322000", "Avinashi Rd"),
            ("Ganga Hospital", "private", "Mettupalayam Road", "0422-2223000", "Mettupalayam Rd")
        ],
        "coords": (11.0168, 76.9558)
    },
    "Cuddalore": {
        "hospitals": [
            ("Govt Headquarter Hospital Cuddalore", "govt", "Gundu Uppalavadi", "04142-230355", "Uppalavadi"),
            ("Krishna Hospital Cuddalore", "private", "Nethaji Road", "04142-220777", "Nethaji Rd")
        ],
        "coords": (11.7480, 79.7714)
    },
    "Dharmapuri": {
        "hospitals": [
            ("Govt Dharmapuri Medical College Hospital", "govt", "Nethaji Bypass Road", "04342-233033", "Nethaji Bypass"),
            ("Sri Gokulam Hospital Dharmapuri", "private", "Salem Main Road", "04342-269900", "Salem Main Rd")
        ],
        "coords": (12.1211, 78.1582)
    },
    "Dindigul": {
        "hospitals": [
            ("Govt Headquarter Hospital Dindigul", "govt", "Balakrishnapuram", "0451-2432211", "Balakrishnapuram"),
            ("Christian Fellowship Hospital Oddanchatram", "trust", "Oddanchatram", "0451-240212", "Oddanchatram")
        ],
        "coords": (10.3673, 77.9803)
    },
    "Erode": {
        "hospitals": [
            ("Govt Headquarters Hospital Erode", "govt", "Chennimalai Road", "0424-2225501", "Chennimalai Rd"),
            ("KMCH Specialty Hospital Erode", "private", "Perundurai Road", "0424-2226000", "Perundurai Rd")
        ],
        "coords": (11.3410, 77.7172)
    },
    "Kallakurichi": {
        "hospitals": [
            ("Govt Headquarters Hospital Kallakurichi", "govt", "Kachirapalayam Road", "04151-222333", "Kachirapalayam Rd"),
            ("Sri Ramachandra Hospital Kallakurichi", "private", "Salem Bypass", "04151-224444", "Salem Bypass")
        ],
        "coords": (11.7383, 78.9639)
    },
    "Kanchipuram": {
        "hospitals": [
            ("Govt Headquarter Hospital Kanchipuram", "govt", "Railway Station Road", "044-27222555", "Railway Station Rd"),
            ("Arignar Anna Memorial Cancer Hospital", "govt", "Karapettai", "044-27263111", "Karapettai")
        ],
        "coords": (12.8387, 79.7016)
    },
    "Kanyakumari": {
        "hospitals": [
            ("Kanyakumari Govt Medical College Hospital", "govt", "Asaripallam, Nagercoil", "04652-223101", "Asaripallam"),
            ("Sree Mookambika Institute of Medical Sciences", "private", "Kulasekharam", "04651-280742", "Kulasekharam")
        ],
        "coords": (8.1833, 77.4119)
    },
    "Karur": {
        "hospitals": [
            ("Govt Medical College Hospital Karur", "govt", "Sanapiratti", "04324-245101", "Sanapiratti"),
            ("Apollo KH Hospital Karur", "private", "Covai Road", "04324-233444", "Covai Rd")
        ],
        "coords": (10.9599, 78.0766)
    },
    "Krishnagiri": {
        "hospitals": [
            ("Govt Headquarters Hospital Krishnagiri", "govt", "Rayakottai Road", "04343-232500", "Rayakottai Rd"),
            ("Sparsh Hospital Hosur", "private", "Hosur Outer Ring Road", "04344-222999", "Hosur ORR")
        ],
        "coords": (12.5186, 78.2137)
    },
    "Madurai": {
        "hospitals": [
            ("Govt Rajaji Hospital Madurai", "govt", "Goripalayam", "0452-2532525", "Goripalayam"),
            ("Meenakshi Mission Hospital and Research Centre", "trust", "Lake Area, Melur Road", "0452-2588741", "Melur Rd"),
            ("Apollo Specialty Hospital Madurai", "private", "K.K. Nagar", "0452-2580892", "K.K. Nagar")
        ],
        "coords": (9.9252, 78.1198)
    },
    "Mayiladuthurai": {
        "hospitals": [
            ("Govt Hospital Mayiladuthurai", "govt", "Koranad", "04364-222345", "Koranad"),
            ("Kaliyappan Hospital Mayiladuthurai", "private", "Pattamangala Street", "04364-224555", "Pattamangala St")
        ],
        "coords": (11.1018, 79.6522)
    },
    "Nagapattinam": {
        "hospitals": [
            ("Govt Headquarter Hospital Nagapattinam", "govt", "Public Office Road", "04365-222122", "Public Office Rd"),
            ("Apollo Reach Hospital Nagapattinam", "private", "Karaikal Main Road", "04365-250100", "Karaikal Main Rd")
        ],
        "coords": (10.7656, 79.8424)
    },
    "Namakkal": {
        "hospitals": [
            ("Govt Headquarter Hospital Namakkal", "govt", "Mohanur Road", "04286-222101", "Mohanur Rd"),
            ("Thangam Hospital Namakkal", "private", "Salem Road", "04286-227702", "Salem Rd")
        ],
        "coords": (11.2189, 78.1674)
    },
    "Nilgiris": {
        "hospitals": [
            ("Govt Headquarter Hospital Ooty", "govt", "Hospital Road, Ooty", "0423-2442212", "Ooty"),
            ("Cantonment Hospital Wellington", "govt", "Wellington", "0423-2282200", "Wellington")
        ],
        "coords": (11.4102, 76.6950)
    },
    "Perambalur": {
        "hospitals": [
            ("Govt Headquarter Hospital Perambalur", "govt", "Elambalur Road", "04328-224322", "Elambalur Rd"),
            ("Dhanalakshmi Srinivasan Medical College Hospital", "private", "Siruvachur", "04328-254500", "Siruvachur")
        ],
        "coords": (11.2342, 78.8821)
    },
    "Pudukkottai": {
        "hospitals": [
            ("Govt Pudukkottai Medical College Hospital", "govt", "Mullur", "04322-222333", "Mullur"),
            ("Muthu Hospital Pudukkottai", "private", "Alangudi Road", "04322-224444", "Alangudi Rd")
        ],
        "coords": (10.3797, 78.8208)
    },
    "Ramanathapuram": {
        "hospitals": [
            ("Govt Headquarter Hospital Ramanathapuram", "govt", "Collectorate Road", "04567-230000", "Collectorate Rd"),
            ("Pioneer Hospital Ramanathapuram", "private", "Salai Street", "04567-220111", "Salai St")
        ],
        "coords": (9.3639, 78.8394)
    },
    "Ranipet": {
        "hospitals": [
            ("Govt Hospital Ranipet", "govt", "Arcot Road", "04172-272222", "Arcot Rd"),
            ("Scudder Memorial Hospital Ranipet", "trust", "Ranipet Town", "04172-272101", "Ranipet Town")
        ],
        "coords": (12.9272, 79.3328)
    },
    "Salem": {
        "hospitals": [
            ("Govt Mohan Kumaramangalam Medical College Hospital", "govt", "Collectorate Road", "0427-2211000", "Collectorate Rd"),
            ("Sri Gokulam Hospital Salem", "private", "Meyyanur 3rd Street", "0427-2448300", "Meyyanur"),
            ("Shanmuga Hospital Salem", "private", "Saradha College Road", "0427-2444400", "Saradha College Rd")
        ],
        "coords": (11.6643, 78.1460)
    },
    "Sivaganga": {
        "hospitals": [
            ("Govt Sivaganga Medical College Hospital", "govt", "Manamadurai Road", "04575-240101", "Manamadurai Rd"),
            ("Karaikudi Govt Hospital", "govt", "Hospital Road, Karaikudi", "04565-238201", "Karaikudi")
        ],
        "coords": (9.8433, 78.4809)
    },
    "Tenkasi": {
        "hospitals": [
            ("Govt Headquarter Hospital Tenkasi", "govt", "Mathalampatti", "04633-222331", "Mathalampatti"),
            ("Krishna Hospital Tenkasi", "private", "Railway Feeder Road", "04633-222444", "Railway Feeder Rd")
        ],
        "coords": (8.9591, 77.3148)
    },
    "Thanjavur": {
        "hospitals": [
            ("Govt Thanjavur Medical College Hospital", "govt", "Medical College Road", "04362-240022", "Medical College Rd"),
            ("Rohini Hospital Thanjavur", "private", "Reddyipalayam Road", "04362-273333", "Reddyipalayam Rd")
        ],
        "coords": (10.7870, 79.1378)
    },
    "Theni": {
        "hospitals": [
            ("Govt Theni Medical College Hospital", "govt", "Kanoor Vilakku", "04546-244501", "Kanoor Vilakku"),
            ("NRT Hospital Theni", "private", "Periyakulam Road", "04546-253333", "Periyakulam Rd")
        ],
        "coords": (10.0104, 77.4768)
    },
    "Thoothukudi": {
        "hospitals": [
            ("Govt Thoothukudi Medical College Hospital", "govt", "Palayamkottai Road", "0461-2321008", "Palayamkottai Rd"),
            ("Sacred Heart Hospital Thoothukudi", "trust", "Great Cotton Road", "0461-2322333", "Great Cotton Rd")
        ],
        "coords": (8.7642, 78.1348)
    },
    "Tiruchirappalli": {
        "hospitals": [
            ("Govt Headquarters Hospital Trichy", "govt", "Collectorate Road", "0431-2415101", "Collectorate Rd"),
            ("Kauvery Hospital Trichy", "private", "Tennur", "0431-4077777", "Tennur"),
            ("Apollo Speciality Hospital Trichy", "private", "Chennai Bypass Road", "0431-3307777", "Chennai Bypass Rd")
        ],
        "coords": (10.7905, 78.7047)
    },
    "Tirunelveli": {
        "hospitals": [
            ("Govt Tirunelveli Medical College Hospital", "govt", "High Ground", "0462-2572733", "High Ground"),
            ("Galaxy Hospital Tirunelveli", "private", "Vannarpettai", "0462-2500000", "Vannarpettai"),
            ("Shifa Hospital Tirunelveli", "private", "Kailasapuram", "0462-2335555", "Kailasapuram")
        ],
        "coords": (8.7139, 77.7567)
    },
    "Tirupathur": {
        "hospitals": [
            ("Govt Hospital Tirupathur", "govt", "G.H. Road", "04179-222333", "GH Rd"),
            ("Vaniyambadi Govt Hospital", "govt", "Vaniyambadi", "04174-232101", "Vaniyambadi")
        ],
        "coords": (12.4934, 78.5678)
    },
    "Tiruppur": {
        "hospitals": [
            ("Govt Headquarters Hospital Tiruppur", "govt", "Dharapuram Road", "0421-2242101", "Dharapuram Rd"),
            ("Revathi Medical Center Tiruppur", "private", "Valipalayam", "0421-2224444", "Valipalayam")
        ],
        "coords": (11.1085, 77.3411)
    },
    "Tiruvallur": {
        "hospitals": [
            ("Govt Headquarters Hospital Tiruvallur", "govt", "C.N.T. Road", "044-27660303", "CNT Rd"),
            ("Saveetha Medical College Hospital", "private", "Thandalam", "044-66726620", "Thandalam")
        ],
        "coords": (13.1438, 79.9079)
    },
    "Tiruvannamalai": {
        "hospitals": [
            ("Govt Tiruvannamalai Medical College Hospital", "govt", "Outer Ring Road", "04175-233333", "Outer Ring Rd"),
            ("Arunai Medical College Hospital", "private", "Velu Nagar", "04175-256555", "Velu Nagar")
        ],
        "coords": (12.2253, 79.0747)
    },
    "Tiruvarur": {
        "hospitals": [
            ("Govt Tiruvarur Medical College Hospital", "govt", "Collectorate Post", "04366-224400", "Collectorate Post"),
            ("KMC Hospital Tiruvarur", "private", "Thanjavur Road", "04366-222555", "Thanjavur Rd")
        ],
        "coords": (10.7725, 79.6360)
    },
    "Vellore": {
        "hospitals": [
            ("Christian Medical College (CMC) Vellore", "trust", "Ida Scudder Road", "0416-2281000", "Ida Scudder Rd"),
            ("Govt Vellore Medical College Hospital", "govt", "Adukkamparai", "0416-2232111", "Adukkamparai")
        ],
        "coords": (12.9165, 79.1325)
    },
    "Viluppuram": {
        "hospitals": [
            ("Govt Viluppuram Medical College Hospital", "govt", "Mundiyampakkam", "04146-232100", "Mundiyampakkam"),
            ("ES Hospital Viluppuram", "private", "Trichy Trunk Road", "04146-258100", "Trichy Trunk Rd")
        ],
        "coords": (11.9401, 79.4861)
    },
    "Virudhunagar": {
        "hospitals": [
            ("Govt Headquarters Hospital Virudhunagar", "govt", "Madurai Road", "04562-242333", "Madurai Rd"),
            ("Sivakasi Govt Hospital", "govt", "Sivakasi", "04562-220101", "Sivakasi")
        ],
        "coords": (9.5680, 77.9624)
    }
}

DEPARTMENTS_TEMPLATES = [
    {
        "name": "Cardiology",
        "head_doctor": "Dr. Ramesh Iyer",
        "treatments": "Bypass Surgery,Angioplasty,Pacemaker Implantation,Heart Valve Surgery",
        "equipment": "Cath Lab,Echocardiography,MRI 3T,Cardiac CT"
    },
    {
        "name": "Oncology",
        "head_doctor": "Dr. Sunita Deshmukh",
        "treatments": "Chemotherapy Session,Tumor Surgical Removal,Radiation Therapy,Immunotherapy",
        "equipment": "Linear Accelerator,PET CT Scanner,Brachytherapy Unit"
    },
    {
        "name": "Orthopedics",
        "head_doctor": "Dr. Anil K. Prasad",
        "treatments": "Knee Joint Replacement,Hip Replacement,Fracture Alignment Surgery,Arthroscopic Ligament Repair",
        "equipment": "Fluoroscopy C-Arm,Orthopedic Navigation System,Arthroscopic Camera"
    },
    {
        "name": "Urology",
        "head_doctor": "Dr. Vikas Reddy",
        "treatments": "Kidney Stone Removal,Lithotripsy,Prostate Laser Surgery,Cystoscopy",
        "equipment": "Holmium Laser,Lithotripter Machine,Rigid & Flexible Cystoscope"
    },
    {
        "name": "Gynecology",
        "head_doctor": "Dr. Meenakshi Sharma",
        "treatments": "Normal Delivery,C-Section Delivery,Hysterectomy,Laparoscopic Ovarian Cyst Removal",
        "equipment": "Ultrasound 4D,Fetal Monitor,Laparoscopic Stack"
    },
    {
        "name": "Nephrology",
        "head_doctor": "Dr. Harish Rao",
        "treatments": "Hemodialysis Session,Kidney Biopsy,Peritoneal Dialysis",
        "equipment": "Dialysis Machine,RO Water Purification Plant,CRRT Machine"
    },
    {
        "name": "Neurology",
        "head_doctor": "Dr. Rajesh Kurup",
        "treatments": "Brain Tumor Surgery,Epilepsy Management,Stroke Thrombolysis,Spinal Decompression",
        "equipment": "EEG Machine,EMG System,Intraoperative Neuromonitoring,Neuronavigation"
    },
    {
        "name": "Pediatrics",
        "head_doctor": "Dr. Preeti Patel",
        "treatments": "Pediatric Vaccination,Neonatal ICU Admission,Pediatric Asthma Management",
        "equipment": "Neonatal Ventilator,Phototherapy Unit,Infant Incubator"
    }
]

DOCTOR_NAMES = [
    "Rajesh Sharma", "Amit Patel", "Vikram Malhotra", "Srinivas Rao", "Ananya Hegde", 
    "Neha Gupta", "Priya Nair", "Sanjay Dutt", "Arjun Kapoor", "Karthik Chawla",
    "Manish Joshi", "Deepak Verma", "Ritu Phogat", "Aditi Rao", "Siddharth Sen"
]

QUALIFICATIONS = ["MBBS, MD, DM", "MBBS, MS, MCh", "MBBS, DNB, Fellowship", "MD, DM (Cardiology)", "MS, MCh (Urology)"]
LANGUAGES_SPOKEN = ["English,Tamil", "English,Tamil,Hindi", "English,Tamil,Telugu", "English,Tamil,Kannada"]

COST_RANGES = {
    "Bypass Surgery": (180000, 480000),
    "Angioplasty": (90000, 240000),
    "Pacemaker Implantation": (80000, 180000),
    "Heart Valve Surgery": (220000, 550000),
    "Chemotherapy Session": (12000, 60000),
    "Tumor Surgical Removal": (110000, 380000),
    "Knee Joint Replacement": (130000, 290000),
    "Hip Replacement": (150000, 320000),
    "Fracture Alignment Surgery": (25000, 85000),
    "Kidney Stone Removal": (35000, 110000),
    "Prostate Laser Surgery": (65000, 160000),
    "Normal Delivery": (18000, 55000),
    "C-Section Delivery": (38000, 115000),
    "Hemodialysis Session": (1800, 4500),
    "Brain Tumor Surgery": (250000, 650000),
    "Pediatric Vaccination": (800, 5000)
}

INSURANCES = ["Star Health", "HDFC ERGO", "New India Assurance", "ICICI Lombard", "Niva Bupa", "Care Health"]

REVIEWS_TEMPLATES = [
    (5, "Excellent treatment. The doctors were very caring and professional. Clean facilities.", "Cardiology"),
    (4, "Satisfied with the urology surgery. Good staff and clean rooms, though billing was slightly slow.", "Urology"),
    (5, "Highly recommend for orthopedics! Dr. Prasad successfully performed knee replacement. Very supportive physiotherapy.", "Orthopedics"),
    (3, "Treatment was ok but the hospital is very crowded. We had to wait for 3 hours for admission.", "Gynecology"),
    (2, "Very expensive! Overcharged for basic medical consumables. However, medical treatment was fine.", "Cardiology"),
    (5, "Saved my mother's life! Excellent emergency response and fast ICU admission. Clean and polite staff.", "Cardiology"),
    (4, "Accredited JCI hospital. Good infrastructure and equipment. Highly professional.", "Oncology"),
    (1, "Rude behavior from the billing department staff. Unhygienic toilets in general ward.", "Nephrology"),
    (5, "Top-class child care. Pediatric doctor was very patient and explained the medication clearly.", "Pediatrics"),
    (4, "My kidney stone removal lithotripsy went smoothly. Affordable cost in comparison to others.", "Urology")
]

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(models.Hospital).count() > 0:
        return
        
    print("Seeding database with Tamil Nadu hospitals...")
    
    # 1. Create Default TQI weights
    for dept_name in ["Cardiology", "Oncology", "Orthopedics", "Urology", "Gynecology", "Nephrology", "Neurology", "Pediatrics", "Default"]:
        w = tqi.DEFAULT_WEIGHTS.get(dept_name, tqi.DEFAULT_WEIGHTS["Default"])
        db_weight = models.TqiWeights(
            treatment_category=dept_name,
            w_specialist=w["w_specialist"],
            w_infra=w["w_infra"],
            w_satisfaction=w["w_satisfaction"],
            w_affordability=w["w_affordability"],
            w_accreditation=w["w_accreditation"],
            w_emergency=w["w_emergency"],
            w_outcome=w["w_outcome"]
        )
        db.add(db_weight)
    db.commit()
    
    # 2. Seed hospitals
    hosp_counter = 1
    for city, city_info in CITIES_DATA.items():
        base_lat, base_lng = city_info["coords"]
        
        for name, h_type, address, phone, sub_loc in city_info["hospitals"]:
            # Introduce small coordinate offsets to spread hospitals around city center
            offset_lat = random.uniform(-0.03, 0.03)
            offset_lng = random.uniform(-0.03, 0.03)
            
            # Select accreditations based on type
            accs = []
            if h_type == "private":
                if random.random() < 0.3:
                    accs = ["NABH", "JCI"]
                else:
                    accs = ["NABH"]
            elif h_type == "trust":
                accs = ["NABH", "ISO"]
            else: # govt
                accs = ["NABH" if random.random() < 0.4 else "ISO"]
                
            acc_str = ",".join(accs)
            
            # Select insurance panels
            ins_count = random.randint(3, 5) if h_type != "govt" else random.randint(1, 2)
            ins_list = random.sample(INSURANCES, ins_count)
            if h_type == "govt" and "CGHS" not in ins_list:
                ins_list.append("CGHS")
            ins_str = ",".join(ins_list)
            
            # Beds capacity
            total_beds = random.choice([80, 100, 150, 200, 300, 400]) if h_type != "govt" else 500
            icu_beds = int(total_beds * random.uniform(0.08, 0.15))
            ot_count = random.choice([2, 3, 4, 6, 8, 12])
            
            hospital = models.Hospital(
                name=name,
                type=h_type,
                address=f"{address}, {city}",
                city=city,
                state="Tamil Nadu",
                lat=base_lat + offset_lat,
                lng=base_lng + offset_lng,
                phone=phone,
                email=f"contact@{name.lower().replace(' ', '').replace('&', '').replace('(', '').replace(')', '')}.com",
                website=f"www.{name.lower().replace(' ', '').replace('&', '').replace('(', '').replace(')', '')}.com",
                operating_hours="24x7",
                emergency_available=True if h_type != "govt" or random.random() < 0.9 else False,
                accreditation=acc_str,
                insurance_panels=ins_str,
                total_beds=total_beds,
                icu_beds=icu_beds,
                ot_count=ot_count,
                verified=True
            )
            db.add(hospital)
            db.flush() # Flush to get hospital.id
            
            # Add Departments (Include 5-7 departments for rich coverage)
            num_depts = random.randint(5, 7)
            depts_to_add = random.sample(DEPARTMENTS_TEMPLATES, num_depts)
            
            for dept_temp in depts_to_add:
                # Specialist count
                specialist_count = random.randint(2, 6) if h_type != "govt" else random.randint(4, 10)
                
                dept = models.Department(
                    hospital_id=hospital.id,
                    name=dept_temp["name"],
                    head_doctor=f"Dr. {random.choice(DOCTOR_NAMES)} {random.choice(['Srinivasan', 'Joshi', 'Sharma', 'Patel'])}",
                    specialist_count=specialist_count,
                    treatments_offered=dept_temp["treatments"],
                    equipment=dept_temp["equipment"]
                )
                db.add(dept)
                db.flush()
                
                # Add Specialists
                for i in range(specialist_count):
                    doc = models.Doctor(
                        hospital_id=hospital.id,
                        name=random.choice(DOCTOR_NAMES) + f" {chr(65+i)}.",
                        specialty=dept.name,
                        qualification=random.choice(QUALIFICATIONS),
                        experience_years=random.randint(6, 28),
                        languages=random.choice(LANGUAGES_SPOKEN),
                        tenure_years=random.randint(2, 14)
                    )
                    db.add(doc)
                
                # Add Cost Estimates
                treatments = dept.treatments_offered.split(",")
                for treatment in treatments:
                    if treatment in COST_RANGES:
                        c_min, c_max = COST_RANGES[treatment]
                        
                        # Adjust cost based on hospital type
                        if h_type == "govt":
                            c_min = int(c_min * 0.2)
                            c_max = int(c_max * 0.2)
                        elif h_type == "trust":
                            c_min = int(c_min * 0.75)
                            c_max = int(c_max * 0.75)
                            
                        jitter = random.uniform(0.9, 1.1)
                        c_min = int(c_min * jitter / 1000) * 1000
                        c_max = int(c_max * jitter / 1000) * 1000
                        
                        cost_est = models.CostEstimate(
                            hospital_id=hospital.id,
                            treatment_name=treatment,
                            cost_min=c_min,
                            cost_max=c_max,
                            currency="INR"
                        )
                        db.add(cost_est)
                
                # Add Reviews for this department
                num_reviews = random.randint(2, 3)
                for _ in range(num_reviews):
                    rating, review_text, review_dept = random.choice(REVIEWS_TEMPLATES)
                    sent_val = sentiment.analyze_review_sentiment(review_text, rating)
                    
                    db_review = models.Review(
                        hospital_id=hospital.id,
                        rating=rating,
                        text=review_text,
                        treatment=dept.name,
                        sentiment_score=sent_val,
                        verified=True,
                        date=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(5, 120))
                    )
                    db.add(db_review)
            
            hosp_counter += 1
            
    db.commit()
    
    # 3. Calculate and cache TQI for all hospitals in database
    all_hospitals = db.query(models.Hospital).all()
    for h in all_hospitals:
        tqi.calculate_and_save_tqi(db, h.id)
        
    print(f"Successfully seeded database with {len(all_hospitals)} Tamil Nadu hospitals.")
