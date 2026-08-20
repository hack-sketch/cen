import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database import engine, Base, SessionLocal
from src.users.models import User
from src.societies.models import Society, Household, JoinRequest
from src.wallet.models import Transaction
from src.marketplace.models import Skill, Resource
from src.events.models import EventItem, VolunteerRequest
from src.complaints.models import Complaint
from src.auth.security import get_password_hash


from src.notices.models import Notice
from src.chat.models import ChatMessage


def reset_and_seed_db():
    print("Resetting database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tables recreated successfully.")

    db = SessionLocal()
    try:
        print("Seeding clean demo data...")
        hashed_pwd = get_password_hash("password123")

        # 1. Create Society Owner
        owner = User(
            id="u-owner",
            name="Aman Owner",
            email="owner@cen.app",
            hashed_password=hashed_pwd,
            role="owner",
        )
        db.add(owner)
        db.flush()

        # 2. Create Active Demo Societies
        demo_soc = Society(
            id="soc-demo",
            name="Green Oasis Society",
            type="Residential Apartment",
            address="100 Garden Way, Block B, Bengaluru",
            latitude=12.9716,
            longitude=77.5946,
            admin_id="u-admin",
            capacity=100,
            initial_credits=20,
            household_range_start=1,
            household_range_end=100,
            coordinator_count=2,  # Operational!
            status="active",
            performance_score=95,
            key="OASIS-2026",
        )
        soc_fresh = Society(
            id="soc-fresh",
            name="Fresh Vista Community",
            type="Residential Apartment",
            address="77 Orchid Boulevard, Indiranagar, Bengaluru",
            latitude=12.96,
            longitude=77.58,
            admin_id="u-admin",
            capacity=150,
            initial_credits=10,
            household_range_start=1,
            household_range_end=150,
            coordinator_count=2,
            status="active",
            performance_score=90,
            key="FRESH-VISTA",
        )
        soc_sunrise = Society(
            id="soc-sunrise",
            name="Sunrise Cultural Society",
            type="Cultural Network",
            address="44 MG Road, Indiranagar, Bengaluru",
            latitude=12.98,
            longitude=77.6,
            admin_id="u-admin",
            capacity=120,
            initial_credits=15,
            household_range_start=1,
            household_range_end=120,
            coordinator_count=2,
            status="active",
            performance_score=88,
            key="SUNRISE-2026",
        )
        soc_emerald = Society(
            id="soc-emerald",
            name="Emerald Heights Enclave",
            type="Residential Gated Community",
            address="78 Palm Grove Road, Koramangala, Bengaluru",
            latitude=12.93,
            longitude=77.61,
            admin_id="u-admin",
            capacity=200,
            initial_credits=25,
            household_range_start=1,
            household_range_end=200,
            coordinator_count=3,
            status="active",
            performance_score=98,
            key="EMERALD-2026",
        )
        soc_royal = Society(
            id="soc-royal",
            name="Royal Palms Gated Society",
            type="Residential Apartment",
            address="12 Royal Enclave, Whitefield, Bengaluru",
            latitude=12.97,
            longitude=77.75,
            admin_id="u-admin",
            capacity=180,
            initial_credits=20,
            household_range_start=1,
            household_range_end=180,
            coordinator_count=2,
            status="active",
            performance_score=86,
            key="PALMS-2026",
        )
        soc_lakeside = Society(
            id="soc-lakeside",
            name="Lakeside NGO & Residency Hub",
            type="Community Hub",
            address="5 Lakeview Rd, HSR Layout, Bengaluru",
            latitude=12.91,
            longitude=77.65,
            admin_id="u-admin",
            capacity=90,
            initial_credits=15,
            household_range_start=1,
            household_range_end=90,
            coordinator_count=2,
            status="active",
            performance_score=92,
            key="LAKESIDE-2026",
        )
        db.add_all([demo_soc, soc_fresh, soc_sunrise, soc_emerald, soc_royal, soc_lakeside])
        db.flush()

        # 3. Create Society Admin
        admin = User(
            id="u-admin",
            name="Rohit Admin",
            email="admin@cen.app",
            hashed_password=hashed_pwd,
            role="admin",
            society_id=demo_soc.id,
            credit_balance=50,
            has_completed_survey=True,
        )
        db.add(admin)

        # 4. Create 2 Coordinators
        coord1 = User(
            id="u-coord1",
            name="Vinay Coordinator",
            email="coord@cen.app",
            hashed_password=hashed_pwd,
            role="coordinator",
            is_coordinator=True,
            society_id=demo_soc.id,
            credit_balance=35,
            has_completed_survey=True,
        )
        coord2 = User(
            id="u-coord2",
            name="Jignesh Coordinator",
            email="coord2@cen.app",
            hashed_password=hashed_pwd,
            role="coordinator",
            is_coordinator=True,
            society_id=demo_soc.id,
            credit_balance=30,
            has_completed_survey=True,
        )
        db.add_all([coord1, coord2])

        # 5. Create Active Residents with Primary Leads & Co-Residents
        res1 = User(
            id="u-res1",
            name="Aman Resident",
            email="resident@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=demo_soc.id,
            household_id="h-101",
            credit_balance=45,
            is_primary_resident=True,  # Primary Lead!
            has_completed_survey=True,
            interests="Music, Guitar, Performing Arts",
            offered_skills_text="Acoustic Guitar Lessons, Music Theory",
            volunteer_interest="Weekend Community Events",
        )
        res1_co = User(
            id="u-res1-co",
            name="Kavita Resident",
            email="kavita@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=demo_soc.id,
            household_id="h-101",
            credit_balance=15,
            is_primary_resident=False,
            has_completed_survey=True,
            interests="Gardening, Cooking",
            offered_skills_text="Home Cooking & Recipes",
            volunteer_interest="Community Events",
        )
        res2 = User(
            id="u-res2",
            name="Aryan Resident",
            email="resident2@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=demo_soc.id,
            household_id="h-102",
            credit_balance=25,
            is_primary_resident=True,
            has_completed_survey=True,
            interests="Tools, Carpentry, Home Repairs",
            offered_skills_text="Electric Power Tools, Basic Plumbing",
            volunteer_interest="Park Clean-Up & Maintenance",
        )
        res3 = User(
            id="u-res3",
            name="Priya Sharma",
            email="priya@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=demo_soc.id,
            household_id="h-103",
            credit_balance=50,
            is_primary_resident=True,
            has_completed_survey=True,
            interests="Technology, Web Dev, Gardening",
            offered_skills_text="Python Coding, Balcony Garden Setup",
            volunteer_interest="Youth Tech Workshops & Eco Drives",
        )
        res3_co = User(
            id="u-res3-co",
            name="Siddharth Sharma",
            email="siddharth@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=demo_soc.id,
            household_id="h-103",
            credit_balance=20,
            is_primary_resident=False,
            has_completed_survey=True,
            interests="Cycling, Fitness",
            offered_skills_text="Bicycle Repair",
            volunteer_interest="Eco Drives",
        )
        res4 = User(
            id="u-res4",
            name="Vikram Malhotra",
            email="vikram@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=demo_soc.id,
            household_id="h-104",
            credit_balance=20,
            is_primary_resident=True,
            has_completed_survey=True,
            interests="Education, Mathematics, Science",
            offered_skills_text="High School Math & Physics Tutoring",
            volunteer_interest="Exam Prep & Skill Swap Fairs",
        )
        res5 = User(
            id="u-res5",
            name="Meera Patel",
            email="meera@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=demo_soc.id,
            household_id="h-105",
            credit_balance=35,
            is_primary_resident=True,
            has_completed_survey=True,
            interests="Wellness, Yoga, Culinary Arts",
            offered_skills_text="Hatha Yoga, Artisan Sourdough Baking",
            volunteer_interest="Health Workshops & Cooking Demos",
        )
        db.add_all([res1, res1_co, res2, res3, res3_co, res4, res5])
        db.flush()

        # 6. Create Households with max_members and occupants_count
        h1 = Household(id="h-101", society_id=demo_soc.id, unit_number="A-101", claimed=True, claimed_by_user_id=res1.id, max_members=4, occupants_count=2)
        h2 = Household(id="h-102", society_id=demo_soc.id, unit_number="A-102", claimed=True, claimed_by_user_id=res2.id, max_members=4, occupants_count=1)
        h3 = Household(id="h-103", society_id=demo_soc.id, unit_number="A-103", claimed=True, claimed_by_user_id=res3.id, max_members=4, occupants_count=2)
        h4 = Household(id="h-104", society_id=demo_soc.id, unit_number="A-104", claimed=True, claimed_by_user_id=res4.id, max_members=4, occupants_count=1)
        h5 = Household(id="h-105", society_id=demo_soc.id, unit_number="A-105", claimed=True, claimed_by_user_id=res5.id, max_members=4, occupants_count=1)
        h6 = Household(id="h-201", society_id=demo_soc.id, unit_number="B-201", claimed=False, max_members=4, occupants_count=0)
        h7 = Household(id="h-202", society_id=demo_soc.id, unit_number="B-202", claimed=False, max_members=4, occupants_count=0)
        db.add_all([h1, h2, h3, h4, h5, h6, h7])

        # 7. Create Marketplace Skills (6 approved skills)
        sk1 = Skill(
            id="sk-guitar",
            title="Acoustic & Electric Guitar Lessons",
            category="Music",
            provider_id=res1.id,
            provider_name=res1.name,
            credits=5,
            description="Beginner to intermediate guitar lessons. 1-hour 1-on-1 practical session.",
            status="approved",
            tags="music,guitar,lessons,acoustic",
            society_id=demo_soc.id,
        )
        sk2 = Skill(
            id="sk-math",
            title="High School Math & Physics Tutoring",
            category="Education",
            provider_id=res4.id,
            provider_name=res4.name,
            credits=8,
            description="Algebra, Calculus & Physics tutoring for Class 9-12 students.",
            status="approved",
            tags="education,math,physics,tutoring",
            society_id=demo_soc.id,
        )
        sk3 = Skill(
            id="sk-garden",
            title="Home Organic Gardening & Balcony Setup",
            category="Home Services",
            provider_id=res3.id,
            provider_name=res3.name,
            credits=6,
            description="Consultation for balcony vegetable gardens, composting, and soil health.",
            status="approved",
            tags="gardening,organic,balcony,home",
            society_id=demo_soc.id,
        )
        sk4 = Skill(
            id="sk-yoga",
            title="Hatha Yoga & Guided Meditation",
            category="Wellness",
            provider_id=res5.id,
            provider_name=res5.name,
            credits=5,
            description="Morning breathing exercises, posture alignment, and stress-relief meditation.",
            status="approved",
            tags="wellness,yoga,meditation,fitness",
            society_id=demo_soc.id,
        )
        sk5 = Skill(
            id="sk-coding",
            title="Python & Web Development Mentorship",
            category="Technology",
            provider_id=res3.id,
            provider_name=res3.name,
            credits=10,
            description="Learn HTML/CSS, JavaScript, and Python backend coding fundamentals.",
            status="approved",
            tags="technology,python,coding,web",
            society_id=demo_soc.id,
        )
        sk6 = Skill(
            id="sk-baking",
            title="Artisan Sourdough & Pastry Baking Masterclass",
            category="Culinary",
            provider_id=res5.id,
            provider_name=res5.name,
            credits=7,
            description="Hands-on sourdough starter maintenance and fresh pastry baking.",
            status="approved",
            tags="cooking,baking,sourdough,pastry",
            society_id=demo_soc.id,
        )
        db.add_all([sk1, sk2, sk3, sk4, sk5, sk6])

        # 8. Create Marketplace Resources (6 approved resources)
        r1 = Resource(
            id="r-mower",
            name="Cordless Electric Lawn Mower",
            category="Tools",
            owner_id=res2.id,
            owner_name=res2.name,
            available=True,
            credits=3,
            status="approved",
            description="Battery-powered lawn mower with grass catcher bag.",
            society_id=demo_soc.id,
        )
        r2 = Resource(
            id="r-washer",
            name="High-Pressure Water Jet Washer",
            category="Tools & Cleaning",
            owner_id=res1.id,
            owner_name=res1.name,
            available=True,
            credits=4,
            status="approved",
            description="1800W pressure washer ideal for car washing and balcony tiles.",
            society_id=demo_soc.id,
        )
        r3 = Resource(
            id="r-ladder",
            name="12-ft Aluminium Telescopic Ladder",
            category="Tools",
            owner_id=res4.id,
            owner_name=res4.name,
            available=True,
            credits=3,
            status="approved",
            description="Heavy-duty foldaway extension ladder for home maintenance.",
            society_id=demo_soc.id,
        )
        r4 = Resource(
            id="r-tent",
            name="4-Person Waterproof Camping Tent Set",
            category="Recreation",
            owner_id=res5.id,
            owner_name=res5.name,
            available=True,
            credits=6,
            status="approved",
            description="Double-layer dome tent with sleeping pads and LED lantern.",
            society_id=demo_soc.id,
        )
        r5 = Resource(
            id="r-projector",
            name="4K Ultra HD Projector & Portable Screen",
            category="Electronics",
            owner_id=res3.id,
            owner_name=res3.name,
            available=True,
            credits=8,
            status="approved",
            description="HDMI/WiFi movie projector with 100-inch collapsible screen.",
            society_id=demo_soc.id,
        )
        r6 = Resource(
            id="r-driller",
            name="Bosch Cordless Hammer Drill Set",
            category="Tools",
            owner_id=res2.id,
            owner_name=res2.name,
            available=True,
            credits=3,
            status="approved",
            description="18V Cordless drill with wall anchors and masonry drill bits.",
            society_id=demo_soc.id,
        )
        db.add_all([r1, r2, r3, r4, r5, r6])

        # 9. Create Events & Volunteer Opportunities
        ev1 = EventItem(
            id="ev-cleanup",
            title="Community Central Park Clean-Up & Landscaping",
            description="Join us for a morning clean-up, tree planting, and flower bed restoration in the central park.",
            date="2026-08-15",
            created_by_coordinator_id=coord1.id,
            volunteers_needed=5,
            volunteers="u-res1,u-res2,u-res3",
            status="upcoming",
            society_id=demo_soc.id,
        )
        ev2 = EventItem(
            id="ev-skillfair",
            title="Summer Time-Bank Skill Swap & Talent Exhibition",
            description="A community gathering to demo skills, swap resources, and meet fellow time-bankers.",
            date="2026-08-20",
            created_by_coordinator_id=coord2.id,
            volunteers_needed=8,
            volunteers="u-res1,u-res4,u-res5",
            status="upcoming",
            society_id=demo_soc.id,
        )
        ev3 = EventItem(
            id="ev-firstaid",
            title="Emergency CPR & First Aid Certification Workshop",
            description="Practical training on emergency first aid, CPR techniques, and fire safety in residential complexes.",
            date="2026-08-25",
            created_by_coordinator_id=coord1.id,
            volunteers_needed=4,
            volunteers="u-res2,u-res3",
            status="upcoming",
            society_id=demo_soc.id,
        )
        db.add_all([ev1, ev2, ev3])

        # 10. Create Complaints & Audits
        c1 = Complaint(
            id="comp-1",
            title="Block B Elevator Noise During Late Night Hours",
            description="Loud grinding sound coming from the elevator shaft between 11 PM and 5 AM.",
            category="Facility Maintenance",
            filed_by_user_id=res1.id,
            filed_by_user_name=res1.name,
            target_coordinator_id=coord1.id,
            is_private=False,
            status="under_review",
            resolution_notes="Lift technician scheduled for inspection on Thursday.",
            society_id=demo_soc.id,
            created_at="2026-08-08",
        )
        c2 = Complaint(
            id="comp-2",
            title="Visitor Parking Slot B-12 Unauthorized Occupation",
            description="Unknown vehicle parked in designated visitor slot for 3 consecutive days.",
            category="Parking Dispute",
            filed_by_user_id=res3.id,
            filed_by_user_name=res3.name,
            target_coordinator_id=coord2.id,
            is_private=False,
            status="resolved",
            resolution_notes="Notice issued to visitor. Vehicle relocated to visitor bay.",
            society_id=demo_soc.id,
            created_at="2026-08-06",
        )
        c3 = Complaint(
            id="comp-3",
            title="Clubhouse Air Conditioner Water Leakage",
            description="AC unit in main reading room dripping water onto wooden flooring.",
            category="Maintenance",
            filed_by_user_id=res4.id,
            filed_by_user_name=res4.name,
            target_coordinator_id=coord1.id,
            is_private=False,
            status="resolved",
            resolution_notes="AC drain line unclogged and filter replaced.",
            society_id=demo_soc.id,
            created_at="2026-08-04",
        )
        db.add_all([c1, c2, c3])

        # 11. Create Notice Board Broadcasts
        n1 = Notice(
            id="n-1",
            society_id=demo_soc.id,
            posted_by_id=admin.id,
            posted_by_name=admin.name,
            title="Overhead Water Tank Cleaning & Pipe Flushing Schedule",
            content="Please note that overhead water tanks in Block A & B will undergo cleaning on Sunday, August 16 from 9:00 AM to 1:00 PM. Water supply will be temporarily paused during these hours.",
            category="High Priority",
            date="2026-08-10",
        )
        n2 = Notice(
            id="n-2",
            society_id=demo_soc.id,
            posted_by_id=coord1.id,
            posted_by_name=coord1.name,
            title="Annual General Body Meeting (AGM) Announcement",
            content="The Annual General Body Meeting for Green Oasis Society will take place at the Community Hall on Sunday, August 30 at 10:30 AM. Agenda details attached in notice board.",
            category="General",
            date="2026-08-09",
        )
        n3 = Notice(
            id="n-3",
            society_id=demo_soc.id,
            posted_by_id=coord2.id,
            posted_by_name=coord2.name,
            title="Free Organic Compost Distribution Drive at Gate 2",
            content="The Green Oasis Eco Team will be distributing free organic garden compost to all resident households this Saturday morning near Gate 2.",
            category="Community",
            date="2026-08-07",
        )
        db.add_all([n1, n2, n3])

        # 12. Create Wallet Transactions
        t1 = Transaction(
            id="t-101",
            user_id=res1.id,
            type="spent",
            amount=8,
            description="Paid Vikram Malhotra for Math & Physics Tutoring session",
            date="2026-08-09",
        )
        t2 = Transaction(
            id="t-102",
            user_id=res4.id,
            type="earned",
            amount=8,
            description="Received credits from Aman Resident for Math Tutoring",
            date="2026-08-09",
        )
        t3 = Transaction(
            id="t-103",
            user_id=res3.id,
            type="spent",
            amount=3,
            description="Paid Aryan Resident for Electric Lawn Mower rental",
            date="2026-08-08",
        )
        t4 = Transaction(
            id="t-104",
            user_id=res2.id,
            type="earned",
            amount=3,
            description="Earned credits from Priya Sharma for Lawn Mower rental",
            date="2026-08-08",
        )
        db.add_all([t1, t2, t3, t4])

        # 13. Create Direct Chat Messages
        m1 = ChatMessage(
            id="m-101",
            sender_id=res1.id,
            sender_name=res1.name,
            receiver_id=res3.id,
            content="Hi Priya! Is the 4K Projector available this Friday evening for movie night?",
        )
        m2 = ChatMessage(
            id="m-102",
            sender_id=res3.id,
            sender_name=res3.name,
            receiver_id=res1.id,
            content="Yes Aman! It's fully charged and ready. You can pick it up from Flat A-103.",
        )
        m3 = ChatMessage(
            id="m-103",
            sender_id=coord1.id,
            sender_name=coord1.name,
            receiver_id=res1.id,
            content="Hi Aman, thanks for signing up to volunteer for the Central Park Clean-Up!",
        )
        db.add_all([m1, m2, m3])

        # 14. Create Sample Join Requests & Unassigned Applicant Users
        nikhil = User(
            id="u-applicant1",
            name="Nikhil Verma",
            email="nikhil@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=None,
            household_id=None,
            credit_balance=0,
            is_primary_resident=False,
            has_completed_survey=True,
            is_active=True,
        )
        divya = User(
            id="u-applicant2",
            name="Divya Patel",
            email="divya@cen.app",
            hashed_password=hashed_pwd,
            role="resident",
            society_id=None,
            household_id=None,
            credit_balance=0,
            is_primary_resident=False,
            has_completed_survey=True,
            is_active=True,
        )
        db.add_all([nikhil, divya])

        jr1 = JoinRequest(
            id="jr-101",
            user_id=nikhil.id,
            user_name=nikhil.name,
            society_id=demo_soc.id,
            household_id="h-101",
            unit_number="A-101",
            id_proof_url="mock://id-proof-nikhil.pdf",
            status="pending",
            approver_type="primary_resident",
            target_approver_id=res1.id,
        )
        jr2 = JoinRequest(
            id="jr-102",
            user_id=divya.id,
            user_name=divya.name,
            society_id=demo_soc.id,
            household_id="h-201",
            unit_number="B-201",
            id_proof_url="mock://id-proof-divya.pdf",
            status="pending",
            approver_type="admin",
            target_approver_id=None,
        )
        db.add_all([jr1, jr2])

        db.commit()
        print("Database seeded with pre-configured demo accounts and items!")
    except Exception as e:
        db.rollback()
        print("Error seeding database:", e)
    finally:
        db.close()


if __name__ == "__main__":
    reset_and_seed_db()
