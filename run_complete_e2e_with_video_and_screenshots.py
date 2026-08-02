import sys
import os
import time
from playwright.sync_api import sync_playwright

def log(msg):
    print(f"[E2E TEST] {msg}", flush=True)

def handle_survey_modal_if_present(page):
    try:
        skip_btn = page.locator('button:has-text("Skip Onboarding Survey"), button:has-text("Skip"), button:has-text("Skip for now")').first
        if skip_btn.is_visible(timeout=2500):
            log("   -> Skip Onboarding Survey modal...")
            skip_btn.click()
            page.wait_for_timeout(1000)
    except Exception:
        pass

def main():
    timestamp = int(time.time())
    user1_email = f"alice_admin_{timestamp}@example.com"
    user2_email = f"bob_resident_{timestamp}@example.com"
    society_name = f"Sunrise Horizon Residency {timestamp}"
    
    os.makedirs("e2e_screenshots", exist_ok=True)
    os.makedirs("e2e_videos", exist_ok=True)

    log("=========================================================")
    log("  STARTING FULL RECORDED E2E TEST WITH SCREENSHOTS & VIDEO")
    log("=========================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir="e2e_videos",
            record_video_size={"width": 1280, "height": 800}
        )
        page = context.new_page()

        try:
            # 1. HOMEPAGE LANDING
            log("STEP 1: Visiting Homepage Landing...")
            page.goto("http://localhost:8080/")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="e2e_screenshots/step01_homepage.png", full_page=True)

            # 2. USER 1 SIGNUP
            log(f"STEP 2: Registering New User 1 ({user1_email})...")
            page.goto("http://localhost:8080/signup")
            page.wait_for_load_state("networkidle")
            page.fill('input[placeholder="John Doe"]', "Alice Admin")
            page.fill('input[placeholder="name@mail.com"]', user1_email)
            page.fill('input[type="password"] >> nth=0', "Password123!")
            page.fill('input[type="password"] >> nth=1', "Password123!")
            page.screenshot(path="e2e_screenshots/step02_signup_form.png", full_page=True)
            page.click('button:has-text("Create Account")')
            page.wait_for_timeout(2500)
            page.screenshot(path="e2e_screenshots/step02_signup_success.png", full_page=True)

            # 3. REQUEST NEW SOCIETY
            log(f"STEP 3: Requesting Setup for Society '{society_name}'...")
            page.goto("http://localhost:8080/request-society")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            page.fill('#sn', society_name)
            page.fill('#addr', "456 Horizon Avenue, Block C")
            page.fill('#an', "Alice Admin")
            page.fill('#ac', user1_email)
            page.fill('#rc', "60")
            page.fill('#ic', "25")
            page.fill('#rs', "To establish a modern time-credit exchange network for our building.")
            page.screenshot(path="e2e_screenshots/step03_request_society_filled.png", full_page=True)
            page.click('button:has-text("Submit application")')
            page.wait_for_timeout(2500)
            page.screenshot(path="e2e_screenshots/step03_society_submitted.png", full_page=True)

            # 4. PLATFORM OWNER APPROVAL
            log("STEP 4: Logging in as Platform Owner to review Society Applications...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")
            page.fill('input[type="email"]', "owner@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/owner/applications")
            page.wait_for_load_state("networkidle")
            page.screenshot(path="e2e_screenshots/step04_owner_applications_list.png", full_page=True)

            approve_btn = page.locator('button:has-text("Approve")').first
            if approve_btn.is_visible(timeout=3000):
                approve_btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="e2e_screenshots/step04_owner_approve_modal.png", full_page=True)
                page.click('button:has-text("Confirm approval")')
                page.wait_for_timeout(2500)
                page.screenshot(path="e2e_screenshots/step04_society_approved.png", full_page=True)

            # 5. USER 2 SIGNUP & JOIN SOCIETY
            log(f"STEP 5: Registering User 2 ({user2_email}) & Joining Society...")
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
            page.locator('button:has-text("Continue")').first.click()
            
            page.wait_for_selector('text=Claim your household', timeout=10000)
            page.wait_for_timeout(1500)
            page.screenshot(path="e2e_screenshots/step05_household_slots.png", full_page=True)

            slot = page.locator('button:not([disabled]):has-text("A-")').first
            if not slot.is_visible(timeout=2000):
                slot = page.locator('div.grid button:not([disabled])').first
            slot.click()
            page.wait_for_timeout(1000)

            page.click('button:has-text("Continue"):not([disabled])')
            page.wait_for_timeout(1000)

            page.click('button:has-text("Continue")')
            page.wait_for_timeout(1000)

            file_input = page.locator('input[type="file"]')
            img_path = os.path.abspath("test_id_proof.png")
            file_input.set_input_files(img_path)
            page.wait_for_timeout(1500)
            page.screenshot(path="e2e_screenshots/step05_id_uploaded.png", full_page=True)

            page.click('button:has-text("Submit Join Request")')
            page.wait_for_timeout(2500)
            page.screenshot(path="e2e_screenshots/step05_join_submitted.png", full_page=True)

            # 6. MEMBER ONBOARDING CONSOLE
            log("STEP 6: Checking Admin Onboarding Console...")
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")
            page.fill('input[type="email"]', "admin@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/admin/onboarding")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            page.screenshot(path="e2e_screenshots/step06_admin_onboarding.png", full_page=True)

            # 7. SKILL OFFERING & APPROVAL
            log("STEP 7: Skill Listing Creation & Approval...")
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

            page.fill('input[placeholder="e.g. Mathematics Tutoring for Grade 6"]', f"Acoustic Guitar Lessons {timestamp}")
            page.fill('textarea[placeholder="Describe what you can offer, session duration, and prerequisites..."]', "Beginner to intermediate acoustic guitar chords and rhythm practice.")
            page.fill('input[placeholder="e.g. math, algebra, highschool"]', "music,guitar,lessons")
            page.screenshot(path="e2e_screenshots/step07_offer_skill_modal.png", full_page=True)
            page.click('button:has-text("Submit Listing")')
            page.wait_for_timeout(2500)

            # Coordinator Approvals Hub
            page.goto("http://localhost:8080/login")
            page.wait_for_load_state("networkidle")
            page.fill('input[type="email"]', "coord@cen.app")
            page.fill('input[type="password"]', "password123")
            page.click('button:has-text("Sign In")')
            page.wait_for_timeout(2500)

            page.goto("http://localhost:8080/app/coord/approvals")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            page.screenshot(path="e2e_screenshots/step07_skill_approval_hub.png", full_page=True)

            approve_skill = page.locator('button:has-text("Approve")').first
            if approve_skill.is_visible(timeout=3000):
                approve_skill.click()
                page.wait_for_timeout(1000)
                page.click('button:has-text("Confirm")')
                page.wait_for_timeout(2500)
                page.screenshot(path="e2e_screenshots/step07_skill_approved.png", full_page=True)

            # 8. SHARED RESOURCES
            log("STEP 8: Shared Resources & Approvals...")
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

            page.fill('input[placeholder="e.g. Electric Lawn Mower (1200W)"]', f"Battery Drill Kit {timestamp}")
            page.fill('textarea[placeholder="Describe the item condition, lending duration limit, and return guidelines..."]', "18V cordless drill with full masonry bits set.")
            page.fill('input[placeholder="e.g. Tools, Electronics"]', "Tools")
            page.screenshot(path="e2e_screenshots/step08_share_resource_modal.png", full_page=True)
            page.click('button:has-text("Submit Listing")')
            page.wait_for_timeout(2500)

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

            approve_res = page.locator('button:has-text("Approve")').first
            if approve_res.is_visible(timeout=3000):
                approve_res.click()
                page.wait_for_timeout(1000)
                page.click('button:has-text("Confirm")')
                page.wait_for_timeout(2500)
                page.screenshot(path="e2e_screenshots/step08_resource_approved.png", full_page=True)

            # 9. COMMUNITY EVENTS
            log("STEP 9: Community Events...")
            page.goto("http://localhost:8080/app/events")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            page.screenshot(path="e2e_screenshots/step09_community_events.png", full_page=True)

            # 10. COMPLAINTS & CONFIDENTIAL AUDIT
            log("STEP 10: Complaints & Confidential Audit...")
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
            page.fill('input[placeholder="Brief title of the issue"]', "Gym AC not cooling")
            page.fill('textarea[placeholder="Please explain the details of your complaint..."]', "Air conditioning unit in central gym area blowing warm air.")
            page.screenshot(path="e2e_screenshots/step10_file_complaint_modal.png", full_page=True)
            page.click('button:has-text("Submit Complaint")')
            page.wait_for_timeout(2500)
            page.screenshot(path="e2e_screenshots/step10_complaint_filed.png", full_page=True)

            # 11. NOTICE BOARD & AI SUMMARIZATION
            log("STEP 11: Notice Board & AI Summarization...")
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
            page.fill('input[placeholder="e.g. Society Maintenance Shutdown"]', f"Elevator Audit Notice {timestamp}")
            page.fill('textarea[placeholder="Draft your announcement detail here..."]', "Annual safety inspection and rope calibration for all elevators will be conducted tomorrow between 10 AM and 4 PM.")
            page.click('button:has-text("Publish Broadcast")')
            page.wait_for_timeout(2500)

            sum_btn = page.locator('button:has-text("Summarize Content (AI)")').first
            if sum_btn.is_visible(timeout=3000):
                sum_btn.click()
                page.wait_for_timeout(3500)
            page.screenshot(path="e2e_screenshots/step11_notice_board_summarized.png", full_page=True)

            # 12. WALLET & TRANSACTIONS
            log("STEP 12: Credit Wallet & Transaction Ledger...")
            page.goto("http://localhost:8080/app/wallet")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            page.screenshot(path="e2e_screenshots/step12_wallet_ledger.png", full_page=True)

            # 13. DIRECT MESSAGING & AI CHATBOT
            log("STEP 13: AI Assistant Chat & Direct Messaging...")
            page.goto("http://localhost:8080/app/chat")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)

            page.fill('input[placeholder="Ask about credits, notice board details, or listings..."]', "How do I earn time credits?")
            page.keyboard.press("Enter")
            page.wait_for_timeout(3500)
            page.screenshot(path="e2e_screenshots/step13_ai_chat_response.png", full_page=True)

            # 14. ADMIN PERFORMANCE & OWNER ANALYTICS
            log("STEP 14: Admin Performance & Owner Analytics...")
            page.goto("http://localhost:8080/app/admin/performance")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            page.screenshot(path="e2e_screenshots/step14_admin_performance.png", full_page=True)

            page.goto("http://localhost:8080/app/owner/analytics")
            page.wait_for_load_state("networkidle")
            handle_survey_modal_if_present(page)
            page.screenshot(path="e2e_screenshots/step14_owner_analytics.png", full_page=True)

            log("=========================================================")
            log("  ALL SCREENSHOTS & VIDEO RECORDED SUCCESSFULLY!")
            log("=========================================================")

        except Exception as e:
            log(f"ERROR DURING TEST: {e}")
            page.screenshot(path="e2e_screenshots/error.png", full_page=True)
            raise e
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    main()
