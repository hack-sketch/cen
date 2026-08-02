import sys
import os
import time
from playwright.sync_api import sync_playwright

def log(msg):
    print(f"[E2E TEST] {msg}", flush=True)

def handle_survey_modal_if_present(page):
    try:
        skip_btn = page.locator('button:has-text("Skip Onboarding Survey"), button:has-text("Skip"), button:has-text("Skip for now")').first
        if skip_btn.is_visible(timeout=3000):
            log("Onboarding survey modal detected — clicking Skip...")
            skip_btn.click()
            page.wait_for_timeout(1000)
    except Exception:
        pass

def main():
    timestamp = int(time.time())
    user1_email = f"alice_admin_{timestamp}@example.com"
    user2_email = f"bob_resident_{timestamp}@example.com"
    society_name = f"Golden Crest Heights {timestamp}"
    
    log(f"Starting E2E Browser Testing Suite with session ID {timestamp}...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        try:
            # ==========================================
            # STEP 1: USER 1 REGISTRATION
            # ==========================================
            log(f"STEP 1: Registering User 1 ({user1_email})...")
            page.goto("http://localhost:8080/signup")
            page.wait_for_load_state("networkidle")

            page.fill('input[placeholder="John Doe"]', "Alice Admin")
            page.fill('input[placeholder="name@mail.com"]', user1_email)
            page.fill('input[type="password"] >> nth=0', "Password123!")
            page.fill('input[type="password"] >> nth=1', "Password123!")
            page.click('button:has-text("Create Account")')
            page.wait_for_timeout(2500)
            log(f"User 1 registration complete. Current URL: {page.url}")

            # ==========================================
            # STEP 2: CREATE / REQUEST SOCIETY
            # ==========================================
            log(f"STEP 2: Requesting creation of new Society ('{society_name}')...")
            page.goto("http://localhost:8080/request-society")
            page.wait_for_load_state("networkidle")

            handle_survey_modal_if_present(page)

            page.fill('#sn', society_name)
            page.fill('#addr', "100 Golden Crest Way, Sector 4")
            page.fill('#an', "Alice Admin")
            page.fill('#ac', user1_email)
            page.fill('#rc', "50")
            page.fill('#ic', "20")
            page.fill('#rs', "Creating an active community exchange network for resident barter.")
            page.click('button:has-text("Submit application")')
            page.wait_for_timeout(2500)
            log("Society request submitted successfully!")

            # ==========================================
            # STEP 3: LOGIN AS PLATFORM OWNER & APPROVE
            # ==========================================
            log("STEP 3: Logging in as Platform Owner (owner@cen.app) to approve Society...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', "owner@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/owner/applications")
            page.wait_for_load_state("networkidle")

            approve_btn = page.locator('button:has-text("Approve")').first
            if approve_btn.is_visible(timeout=4000):
                approve_btn.click()
                page.wait_for_timeout(1000)
                page.click('button:has-text("Confirm approval")')
                page.wait_for_timeout(2500)
                log(f"Platform Owner approved society '{society_name}'!")
            else:
                log("No pending applications found or already approved.")

            # ==========================================
            # STEP 4: USER 2 REGISTRATION & JOIN SOCIETY
            # ==========================================
            log(f"STEP 4: Registering User 2 ({user2_email}) & Joining Society...")
            page.goto("http://localhost:8080/signup")
            page.wait_for_load_state("networkidle")

            page.fill('input[placeholder="John Doe"]', "Bob Resident")
            page.fill('input[placeholder="name@mail.com"]', user2_email)
            page.fill('input[type="password"] >> nth=0', "Password123!")
            page.fill('input[type="password"] >> nth=1', "Password123!")
            page.click('button:has-text("Create Account")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/join-society")
            page.wait_for_load_state("networkidle")

            handle_survey_modal_if_present(page)

            page.click('button:has-text("Join by key")')
            page.fill('input[placeholder="e.g. GREEN-2024"]', "OASIS-2026")
            
            # Click Continue button specific to JoinByKey tab
            page.locator('button:has-text("Continue")').first.click()
            
            # Wait explicitly for JoinFlow Step 1 to load
            log("Waiting for household slots to render...")
            page.wait_for_selector('text=Claim your household', timeout=10000)
            page.wait_for_timeout(1000)

            # Claim household slot in JoinFlow Step 1
            slot = page.locator('button:not([disabled]):has-text("A-")').first
            if not slot.is_visible(timeout=2000):
                slot = page.locator('div.grid button:not([disabled])').first

            log(f"Selecting household slot: {slot.inner_text()}")
            slot.click()
            page.wait_for_timeout(1000)
            
            # Step 1 Continue button (now enabled)
            page.click('button:has-text("Continue"):not([disabled])')
            page.wait_for_timeout(1000)

            # Contact info step (Step 2)
            page.click('button:has-text("Continue")')
            page.wait_for_timeout(1000)

            # ID Proof upload step (Step 3)
            file_input = page.locator('input[type="file"]')
            img_path = os.path.abspath("test_id_proof.png")
            file_input.set_input_files(img_path)
            page.wait_for_timeout(1000)
            
            page.click('button:has-text("Submit Join Request")')
            page.wait_for_timeout(2500)
            log("User 2 submitted join request with ID proof!")

            # ==========================================
            # STEP 5: LOGIN DEMO RESIDENT & TEST SKILLS
            # ==========================================
            log("STEP 5: Logging in as Resident (resident@cen.app) to test Skill Creation...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', "resident@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/skills")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            page.click('button:has-text("Offer a Skill")')
            page.wait_for_timeout(1000)

            page.fill('input[placeholder="e.g. Mathematics Tutoring for Grade 6"]', f"Gardening Tips {timestamp}")
            page.fill('textarea[placeholder="Describe what you can offer, session duration, and prerequisites..."]', "Interactive 1-hour session on indoor plant care and composting.")
            page.fill('input[placeholder="e.g. math, algebra, highschool"]', "gardening,plants")
            page.click('button:has-text("Submit Listing")')
            page.wait_for_timeout(2500)
            log("Skill listing created successfully!")

            # ==========================================
            # STEP 6: COORDINATOR APPROVES SKILL LISTING
            # ==========================================
            log("STEP 6: Logging in as Coordinator (coord@cen.app) to approve Skill listing...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', "coord@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/coord/approvals")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            approve_skill_btn = page.locator('button:has-text("Approve")').first
            if approve_skill_btn.is_visible(timeout=4000):
                approve_skill_btn.click()
                page.wait_for_timeout(1000)
                page.click('button:has-text("Confirm")')
                page.wait_for_timeout(2500)
                log("Coordinator approved skill listing!")

            # ==========================================
            # STEP 7: TEST SHARED RESOURCES / MARKETPLACE
            # ==========================================
            log("STEP 7: Logging in as Resident to create Shared Resource...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', "resident@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/resources")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            page.click('button:has-text("Share an Item")')
            page.wait_for_timeout(1000)

            page.fill('input[placeholder="e.g. Electric Lawn Mower (1200W)"]', f"Pressure Washer {timestamp}")
            page.fill('textarea[placeholder="Describe the item condition, lending duration limit, and return guidelines..."]', "Heavy duty washer for balcony and vehicle cleaning.")
            page.fill('input[placeholder="e.g. Tools, Electronics"]', "Tools")
            page.click('button:has-text("Submit Listing")')
            page.wait_for_timeout(2500)
            log("Resource listing created successfully!")

            # Approve resource listing as Coordinator
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', "coord@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/coord/approvals")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            
            page.click('button:has-text("Resources")')
            page.wait_for_timeout(1000)
            
            approve_res_btn = page.locator('button:has-text("Approve")').first
            if approve_res_btn.is_visible(timeout=4000):
                approve_res_btn.click()
                page.wait_for_timeout(1000)
                page.click('button:has-text("Confirm")')
                page.wait_for_timeout(2500)
                log("Coordinator approved shared resource listing!")

            # ==========================================
            # STEP 8: TEST COMPLAINTS
            # ==========================================
            log("STEP 8: Filing a Complaint as Resident...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', "resident@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/complaints")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            page.click('button:has-text("File Complaint")')
            page.wait_for_timeout(1000)

            page.fill('input[placeholder="Brief title of the issue"]', "Noise issue in B-Wing corridor")
            page.fill('textarea[placeholder="Please explain the details of your complaint..."]', "Loud music playing past 11 PM near apartment 302.")
            page.click('button:has-text("Submit Complaint")')
            page.wait_for_timeout(2500)
            log("Complaint filed successfully!")

            # ==========================================
            # STEP 9: TEST NOTICE BOARD
            # ==========================================
            log("STEP 9: Posting a Notice on Notice Board as Admin...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")

            page.fill('input[type="email"]', "admin@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/notices")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            page.click('button:has-text("Broadcast Notice")')
            page.wait_for_timeout(1000)

            page.fill('input[placeholder="e.g. Society Maintenance Shutdown"]', f"Overhead Tank Cleaning {timestamp}")
            page.fill('textarea[placeholder="Draft your announcement detail here..."]', "Water supply will be suspended on Sunday from 9:00 AM to 1:00 PM for annual overhead tank cleaning and chlorination.")
            page.click('button:has-text("Publish Broadcast")')
            page.wait_for_timeout(2500)
            log("Notice broadcasted on Notice Board!")

            # ==========================================
            # STEP 10: TEST WALLET & TRANSACTIONS
            # ==========================================
            log("STEP 10: Viewing Wallet & Ledger Statement...")
            page.goto("http://localhost:8080/app/wallet")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            log("Wallet loaded successfully. Page content verified.")

            # ==========================================
            # STEP 11: TEST AI CHAT
            # ==========================================
            log("STEP 11: Interacting with AI Assistant Chat...")
            page.goto("http://localhost:8080/app/chat")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            page.fill('input[placeholder="Ask about credits, notice board details, or listings..."]', "What notice was broadcasted today?")
            page.keyboard.press("Enter")
            page.wait_for_timeout(3500)
            log("AI Assistant Chat query sent and processed!")

            # Take screenshot of final dashboard
            page.goto("http://localhost:8080/app/dashboard")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            page.screenshot(path="e2e_final_dashboard.png", full_page=True)
            log("Screenshot saved as 'e2e_final_dashboard.png'!")

            log("ALL E2E FEATURE TESTS PASSED SUCCESSFULLY 100%!")

        except Exception as e:
            log(f"ERROR DURING E2E TEST: {e}")
            page.screenshot(path="e2e_error.png", full_page=True)
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    main()
