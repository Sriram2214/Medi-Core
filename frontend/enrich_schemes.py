import json
import re

with open(r"C:\Hoscoo det\frontend\src\data\schemes.json", "r", encoding="utf-8") as f:
    schemes = json.load(f)

# Comprehensive mapping for known keywords and schemes to official portals (CHECKED FIRST)
url_rules = [
    (r"CMCHIS|Chief Minister.*Insurance|Kalaignar", "https://www.cmchistn.com/"),
    (r"108|Ambulance|EMRI|NK-48|Nammai Kaakkum", "https://www.emri.in/tamil-nadu/"),
    (r"Muthulakshmi|Maternity|PICME|Pregnant", "https://picme.tn.gov.in/"),
    (r"Makkalai Thedi|Doorstep|Amma Clinic|Patham Pathukappom|NHM|Dialysis", "https://nhm.tn.gov.in/en"),
    (r"Pudhumai Penn|Moovalur", "https://www.pudhumaippen.tn.gov.in/"),
    (r"Naan Mudhalvan|Skill", "https://www.naanmudhalvan.tn.gov.in/"),
    (r"Breakfast|School Education", "https://tnschools.gov.in/"),
    (r"Ayushman|PMJAY|Pradhan Mantri Jan Arogya|AB-PMJAY", "https://pmjay.gov.in/"),
    (r"Jan Aushadhi|PMBJP|Medicines", "https://janaushadhi.gov.in/"),
    (r"National Health Mission|NHM Central", "https://nhm.gov.in/"),
    (r"TB|Tuberculosis|Nikshay|RNTCP", "https://www.nikshay.in/"),
    (r"AIDS|NACO|HIV", "https://naco.gov.in/"),
    (r"Mental Health|Tele-MANAS|MANAS", "https://telemanas.mohfw.gov.in/"),
    (r"ECHS|Ex-Servicemen", "https://echs.gov.in/"),
    (r"CGHS|Central Government Health", "https://cghs.nic.in/"),
    (r"ESI|Employee.*State Insurance|ESIC", "https://www.esic.gov.in/"),
    (r"Leprosy|NLEP|Vector Borne|Malaria|Dengue|NVBDCP|Blindness|NPCB|Deafness|NPCDCS|Cancer|Diabetes|Cardiovascular", "https://dghs.gov.in/"),
    (r"Welfare Board|Unorganised|Labour|Workers|Construction|Driver|Tailor|Weaver|Fishermen|Artisan", "https://tnuwwb.tn.gov.in/"),
    (r"Disability|Differently Abled|UDID|Sugamya", "https://www.swavlambancard.gov.in/"),
    (r"Senior Citizen|Elderly|Vayoshri|SACRED", "https://socialjustice.gov.in/"),
    (r"Tribal|Swasthya|Trifed", "https://tribal.nic.in/"),
    (r"Ayush|Yoga|Siddha|Ayurveda|Homeopathy", "https://ayush.gov.in/"),
    (r"Digital Health|ABDM|Health ID|ABHA", "https://abdm.gov.in/"),
    (r"Indradhanush|Immunization|Vaccine|U-WIN|CoWIN", "https://uwin.gov.in/"),
    (r"Surakshit Matritva|SUMAN|Janani Suraksha|JSSK|PMSMA", "https://suman.mohfw.gov.in/"),
    (r"Poshan|Nutrition|Anganwadi|ICDS", "https://poshanabhiyaan.gov.in/"),
    (r"Rare Disease|Orphan", "https://rarediseases.mohfw.gov.in/")
]

def get_direct_url(scheme):
    text = str(scheme.get('Official Source / Helpline', ''))
    name = str(scheme.get('Scheme Name', ''))
    combined = f"{name} {text}"
    
    # 1. ALWAYS Match against verified rule patterns FIRST!
    for pattern, portal in url_rules:
        if re.search(pattern, combined, re.IGNORECASE):
            return portal
            
    # 2. Check if text explicitly has a real working URL starting with http:// or https:// or www.
    url_regex = re.compile(r"(https?://[^\s]+)|(www\.[^\s]+)", re.IGNORECASE)
    match = url_regex.search(text)
    if match:
        url = match.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        return url

    # 3. If no rule or strict URL, check if TN or Central
    if re.search(r"TN|Tamil Nadu|Chief Minister|Amma|Kalaignar|State", combined, re.IGNORECASE):
        return "https://tnhealth.tn.gov.in/"
    
    return "https://www.myscheme.gov.in/"

count = 0
for s in schemes:
    s['Direct_URL'] = get_direct_url(s)
    count += 1

with open(r"C:\Hoscoo det\frontend\src\data\schemes.json", "w", encoding="utf-8") as f:
    json.dump(schemes, f, ensure_ascii=False, indent=2)

print(f"Successfully enriched {count} schemes with verified direct portal URLs.")
