# Community Exchange Network (CEN) — Master Engineering & State Documentation

**Repository:** `git@github.com:22f1000682/MAY2026-Team-094.git`  
**Active Branch:** `feature/cen-updates`  
**Session / Conversation ID:** `08bab184-8aff-4492-b886-7039d0a841d7`  
**Last Updated:** August 20, 2026  

---

## 📑 Table of Contents
1. [Executive System Overview](#1-executive-system-overview)
2. [Complete Detailed Feature Summaries (Features 1 – 10)](#2-complete-detailed-feature-summaries-features-1--10)
3. [Complete API Specification (All 12 Modules)](#3-complete-api-specification-all-12-modules)
4. [Complete Test Cases Reference Suite](#4-complete-test-cases-reference-suite)
5. [Deferred / Roadmap Items (Feature 5)](#5-deferred--roadmap-items-feature-5)
6. [Resuming Work on Any Day](#6-resuming-work-on-any-day)

---

## 1. Executive System Overview

The **Community Exchange Network (CEN)** is a multi-tenant residential platform facilitating skills exchange, tool sharing, community volunteering, grievance resolution, and time-credit economy management across residential societies.

- **Backend:** FastAPI (Python 3.12), SQLAlchemy, SQLite, Pydantic v2, Google Gemini AI (Interactions / RAG API), Pytest test suite.
- **Frontend:** React 19, Vite, TanStack Router & Query, Tailwind CSS, Radix UI / Shadcn.
- **Current Health Status:**
  - **47 / 47 backend tests passing** (`pytest`)
  - **0 TypeScript compilation errors** (`npx tsc --noEmit`)

---

## 2. Complete Detailed Feature Summaries (Features 1 – 10)

### 🔹 Feature 1: Password Reset Endpoint & Recovery Flow
- **Business Logic:** Users who forget their password or need a credential reset require an accessible direct recovery endpoint and UI flow without getting trapped in token errors.
- **Backend Implementation:** Added `POST /api/v1/auth/reset-password` taking `email`, `new_password`, and `confirm_password`. Validates user existence, hashes the new password with passlib/bcrypt, updates the user record, and logs an audit entry.
- **Frontend Implementation:** Built a dedicated "Forgot Password / Reset Password" form accessible from the authentication screen, handling password confirmation validation and redirecting to login on success.
- **Commit:** `3317e62` — *feat(auth): add password reset endpoint and recovery flow*

---

### 🔹 Feature 2: Atomic "Leave Society" Cleanup
- **Business Logic:** When a resident vacates or departs a residential society, their association must be terminated cleanly and atomically without leaving orphan records or occupying locked flat slots.
- **Backend Implementation:** Added `POST /api/v1/societies/leave`. Atomically unassigns `user.society_id`, `user.household_id`, revokes coordinator privileges (`is_coordinator=False`, `role='resident'`), unclaims their linked household unit slot (`household.claimed=False`, `household.claimed_by_user_id=None`), cancels pending join requests, and marks their active marketplace listings and pending bookings as cancelled.
- **Frontend Implementation:** Added a prominent "Leave Society" confirmation dialog in the Resident Profile / Settings view with an explicit warning of credit state and unlinking.
- **Commit:** `a99b2fd` — *feat(societies): atomic leave society cleanup and household unclaiming*

---

### 🔹 Feature 3: Household Join Request Secondary Resident Permission Gating
- **Business Logic:** When a prospective resident requests to join an already-claimed household unit, only the Primary Lead resident (or admin/coordinators) can review the application. Secondary co-occupants in the same unit must be restricted from approving join requests.
- **Backend Implementation:** Updated `POST /api/v1/societies/join-requests/{id}/approve` and `reject`. Injected hierarchical permission checks: if the target household is already claimed, only the user designated as `household.claimed_by_user_id` or an admin/coordinator can authorize new co-occupant joins. Secondary occupants attempting to approve receive `403 Forbidden`.
- **Frontend Implementation:** Gated approval/rejection action buttons in the Household management queue so they only render active for primary household leads and society moderators.
- **Commit:** `f7c7631` — *feat(societies): household join request secondary resident permission gating*

---

### 🔹 Feature 4: Society Application Rejection Remarks & Resubmission Pathway
- **Business Logic:** Platform owners rejecting a society onboarding proposal must provide clear feedback explaining why it was declined, and the applicant must have an unobstructed path to edit remarks and resubmit without duplicate onboarding errors.
- **Backend Implementation:** Added `rejection_reason` column to `SocietyApplication`. Updated `POST /api/v1/societies/applications/{id}/reject` to require a mandatory rejection reason payload. Implemented `POST /api/v1/societies/applications/{id}/resubmit` allowing the applicant to revise parameters, resetting status back to `pending`.
- **Frontend Implementation:** Enhanced Platform Owner approval modal to require rejection remarks before confirmation. Updated Applicant Onboarding view to display rejection feedback in an alert banner alongside an interactive "Revise & Resubmit" form.
- **Commit:** `72889ed` — *feat(societies): society application rejection remarks and resubmission workflow*

---

### 🔹 Feature 6: Dynamic Platform Owner Cross-Community User Directory
- **Business Logic:** Platform owners require full operational visibility across all registered individuals across all communities from a single dynamic live directory.
- **Backend Implementation:** Updated `GET /api/v1/users` when called by Platform Owner: performs live database query retrieving active registered profiles across all societies, including cross-society attributes, joined dates, household units, and role scopes.
- **Frontend Implementation:** Bound the Owner Management Users Table to the live cross-community endpoint, complete with global search, status badges, and society tag indicators.
- **Commit:** `f1994dc` — *feat(analytics): dynamic platform owner cross-community user directory*

---

### 🔹 Feature 7: Strict Community Suspension Lockdown Guard & Interceptor
- **Business Logic:** When an entire society network is suspended by platform authorities due to disputes or compliance infractions, all operational access (skills, resources, wallet transfers, chat, events) for its members must be immediately frozen while providing a clear notice and exit pathway.
- **Backend Implementation:** Updated global request validation middleware (`check_society_active_middleware`). If an incoming request originates from a user whose `society.status == 'suspended'`, immediately aborts execution and returns `403 Forbidden` with error code `SOCIETY_SUSPENDED` and the specific suspension reason.
- **Frontend Implementation:** Implemented a global Axios/Fetch response interceptor. Upon detecting `SOCIETY_SUSPENDED`, instantly redirects the user to `/app/suspended-lockdown` view displaying the suspension notice and providing a 1-click "Leave Suspended Society" button to regain standard account access.
- **Commit:** `319cccd` — *feat(security): strict community suspension lockdown guard and interceptor*

---

### 🔹 Feature 8: Trade Dispute Secondary Participant Counter-Justification
- **Business Logic:** In trade and service disputes, procedural fairness requires that both the booking creator and the secondary counterparty have equal rights to submit statements, notes, and evidence before coordinator arbitration.
- **Backend Implementation:** Adjusted dispute access control rules on `POST /api/v1/disputes/{id}/notes` and dispute detail routes. Fully authorized the secondary counterparty (`booking.buyer_id` or `booking.owner_id`) alongside the creator and coordinator.
- **Frontend Implementation:** Unlocked comment fields, evidence inputs, and justification submission buttons on the Dispute Resolution view for both primary and secondary participants.
- **Commit:** `db1b1fd` — *feat(disputes): secondary participant counter-justification and unlocked UI controls*

---

### 🔹 Feature 9: AI-Enhanced Layman Search & Summarization (True RAG Pipeline)
- **Business Logic:** Residents searching for services or tools use everyday colloquial language (e.g., *"water dripping under bathroom sink"* or *"mount heavy painting on wall"*) rather than exact technical terms.
- **Backend Implementation:** Implemented a true **RAG (Retrieval-Augmented Generation)** pipeline in `POST /api/v1/ai/match-marketplace`:
  1. *Retrieval:* Fetches live approved skills and tools scoped to resident's `society_id` from DB.
  2. *Augmentation:* Embeds live catalog into structured LLM prompt.
  3. *Generation:* Google Gemini LLM parses user layman intent, scores semantic relevance (60–98%), synthesizes a 1–2 sentence plain-English summary, and extracts 2–3 intent badges.
  4. *Offline Fallback:* Multi-category synonym ontology ensuring zero downtime if offline or rate-limited.
- **Frontend Implementation:** Search bar in Skills & Resources views detects queries $\ge 3$ characters and displays a 1-click **`✨ Ask AI to analyze and summarize matches for "{q}"`** quick-action chip. Result cards render percentage match badges, highlighted **AI Summary & Scope** banners, and dynamic intent pill tags.
- **Commit:** `0b7e58a` — *feat(ai): true LLM RAG semantic intent parsing and layman summarization in marketplace*

---

### 🔹 Feature 10: Coordinator Rejection Reasons & Resident Edit-on-Relist Workflow
- **Business Logic:** When a coordinator declines a skill or resource listing, a clear mandatory reason must be recorded. The provider must be able to revise the listing to fix issues and resubmit it for review without starting from scratch.
- **Backend Implementation:** Added `rejection_reason` column to `Skill` and `Resource` tables. Updated `POST /skills/{id}/reject` and `POST /resources/{id}/reject` to require `ItemRejectPayload` with non-empty reason. Added `PUT /skills/{id}` and `PUT /resources/{id}`: applies edits, automatically resets status to `pending`, and clears previous rejection remarks.
- **Frontend Implementation:** Enhanced Coordinator Approvals modal to require rejection reasons. In resident "My Listings" tab, rejected items display an alert banner with the coordinator's feedback and an **"Edit & Resubmit"** modal that pre-populates details and resubmits for review.
- **Commit:** `3ccca12` — *feat(marketplace): coordinator rejection reasons and resident edit-on-relist workflow*

---

## 3. Complete API Specification (All 12 Modules)

### 3.1 Authentication Module (`/auth`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Public | Account Creation | Registers a new resident or admin user with password hashing and initial role assignment. |
| `POST` | `/api/v1/auth/login` | Public | User Authentication | Authenticates credentials and issues a JWT access token for session security. |
| `GET` | `/api/v1/auth/me` | Authenticated | Session Profile Check | Retrieves current authenticated user details and active role scope. |
| `POST` | `/api/v1/auth/reset-password` | Public | Credential Recovery | Directly resets password for user matching registered email. |

---

### 3.2 Users & Profiles Module (`/users`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/me` | Authenticated | Profile Management | Returns current authenticated user profile attributes and credit balance. |
| `PATCH` | `/api/v1/users/me` | Authenticated | Profile Update | Updates full name, contact information, and resident bio details. |
| `POST` | `/api/v1/users/me/survey` | Authenticated | Profile Onboarding | Saves 3-step user onboarding survey (interests, skills offered, volunteering preference). |
| `POST` | `/api/v1/users/me/id-proof` | Authenticated | Document Upload | Uploads resident Aadhaar or government ID proof document as a Base64 string. |
| `GET` | `/api/v1/users` | Admin / Coordinator / Owner | Resident Directory | Fetches list of registered residents within a specific society (or all societies for Owner). |
| `GET` | `/api/v1/users/coordinators` | Authenticated | Coordinator Roster | Fetches active coordinators assigned to moderate a society. |
| `GET` | `/api/v1/users/{user_id}` | Admin / Owner | User Inspection | Retrieves detailed profile of a specific user by unique ID. |
| `POST` | `/api/v1/users/{user_id}/promote` | Admin / Owner | Role Promotion | Elevates a standard resident's role to Coordinator with granular permissions. |
| `POST` | `/api/v1/users/{user_id}/demote` | Admin / Owner | Role Demotion | Revokes Coordinator privileges and demotes user back to Resident status. |
| `POST` | `/api/v1/users/{user_id}/verify-id-proof` | Admin / Coordinator | ID Verification | Performs manual or AI-assisted ID document verification for a user. |

---

### 3.3 Societies & Onboarding Module (`/societies`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/societies/applications` | Authenticated | Society Setup Proposal | Submits an application to onboard a brand-new residential community on the platform. |
| `GET` | `/api/v1/societies/applications` | Owner | Application Review | Lists all pending society setup applications awaiting Platform Owner evaluation. |
| `GET` | `/api/v1/societies/applications/me` | Authenticated | Setup Status Tracking | Retrieves status of society setup application submitted by current user. |
| `DELETE` | `/api/v1/societies/applications/{id}` | Owner | Cancel Application | Withdraws or removes a pending society setup request. |
| `POST` | `/api/v1/societies/applications/{id}/approve` | Owner | Approve Society Setup | Approves society application, provisions unique invite key (OASIS-2026), and activates society. |
| `POST` | `/api/v1/societies/applications/{id}/reject` | Owner | Reject Society Setup | Rejects a society setup proposal with mandatory rejection reason. |
| `POST` | `/api/v1/societies/applications/{id}/resubmit` | Authenticated | Resubmit Application | Allows founder to revise details and resubmit a rejected society application. |
| `GET` | `/api/v1/societies` | Public / Auth | Browse Network | Lists active residential communities registered in the exchange network. |
| `GET` | `/api/v1/societies/{society_id}` | Public / Auth | Society Lookup | Fetches society profile details, address, capacity, and coordinator count. |
| `PATCH` | `/api/v1/societies/{society_id}/config` | Admin / Owner | Society Configuration | Updates society capacity caps, initial credit amounts, or address metadata. |
| `POST` | `/api/v1/societies/{society_id}/suspend` | Owner | Network Suspension | Temporarily suspends or locks down an active society network with a specific reason. |
| `POST` | `/api/v1/societies/{society_id}/revoke-suspension` | Owner | Restore Network | Restores a suspended society network to full active operational status. |
| `GET` | `/api/v1/societies/{society_id}/households` | Public / Auth | Unit Grid Lookup | Fetches all household unit slots and their occupancy states (is_taken). |
| `GET` | `/api/v1/societies/{society_id}/join-requests` | Admin / Coordinator | Membership Queue | Lists pending resident join requests and linked ID proofs for approval review. |
| `POST` | `/api/v1/societies/join-requests` | Authenticated | Submit Join Request | Submits join request with selected flat unit slot and uploaded ID proof document. |
| `GET` | `/api/v1/societies/join-requests/me` | Authenticated | Track Join Request | Retrieves resident's current pending or approved society join request status. |
| `POST` | `/api/v1/societies/join-requests/{id}/approve` | Admin / Primary Resident | Approve Resident Join | Approves resident join request (enforcing Primary Lead gating for claimed flats) and grants initial credits. |
| `POST` | `/api/v1/societies/join-requests/{id}/reject` | Admin / Primary Resident | Reject Resident Join | Rejects resident join request and frees claimed household unit slot. |
| `DELETE` | `/api/v1/societies/join-requests/{id}` | Admin / Resident | Cancel Join Request | Cancels pending join request submission. |
| `POST` | `/api/v1/societies/leave` | Authenticated | Leave Society | Atomically unlinks resident, unclaims flat, cancels listings/requests, and resets coordinator privileges. |

---

### 3.4 Household Registry Module (`/households`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/households` | Authenticated | Household Registry | Lists housing units registered in a society sorted by unit identifier. |
| `POST` | `/api/v1/households` | Admin / Owner | Manual Unit Entry | Registers an individual housing unit slot manually. |
| `POST` | `/api/v1/households/bulk` | Admin / Owner | Bulk Range Setup | Dynamically generates a sequential range of household units (e.g. Block A 101 to 105). |
| `PUT` | `/api/v1/households/{id}` | Admin / Owner | Unit Update | Edits unit number or block identifier for a registered household. |
| `DELETE` | `/api/v1/households/{id}` | Admin / Owner | Unit Removal | Removes an unclaimed housing unit card from the registry. |
| `DELETE` | `/api/v1/households/society/{id}` | Admin / Owner | Clear Registry | Clears all registered household units for a society. |

---

### 3.5 Time-Credit Wallet Module (`/wallet`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/wallet/balance` | Authenticated | Credit Economy Check | Retrieves resident's current time-credit token balance and transaction ledger. |
| `GET` | `/api/v1/wallet/transactions` | Authenticated | Transaction Ledger | Fetches complete chronological history of credit earnings, transfers, and spends. |
| `POST` | `/api/v1/wallet/transfer` | Authenticated | Peer-to-Peer Transfer | Executes atomic credit transfer to a neighbor for completed services or shared goods. |

---

### 3.6 Marketplace: Skills Exchange (`/marketplace/skills`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/marketplace/skills` | Authenticated | Browse Skills | Fetches all skill session offerings approved by a coordinator (APPROVED status). |
| `POST` | `/api/v1/marketplace/skills` | Authenticated | Offer a Skill | Submits a new skill session offer (defaults to PENDING approval status). |
| `PUT` | `/api/v1/marketplace/skills/{id}` | Provider / Admin | Edit & Resubmit Skill | Updates skill details and automatically resets moderation status back to pending review. |
| `GET` | `/api/v1/marketplace/skills/pending` | Coordinator / Admin | Moderation Queue | Lists skill session offers awaiting coordinator approval review. |
| `POST` | `/api/v1/marketplace/skills/{id}/approve` | Coordinator / Admin | Approve Skill Listing | Approves skill listing (enforces strict self-approval prevention rule). |
| `POST` | `/api/v1/marketplace/skills/{id}/reject` | Coordinator / Admin | Reject Skill Listing | Rejects skill listing with mandatory moderation feedback reason. |
| `POST` | `/api/v1/marketplace/skills/{id}/book` | Authenticated | Book Skill Session | Books an approved skill, creating a booking request for owner confirmation. |

---

### 3.7 Marketplace: Shared Resources (`/marketplace/resources`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/marketplace/resources` | Authenticated | Browse Resources | Fetches all available and approved community physical tools/items for borrowing. |
| `POST` | `/api/v1/marketplace/resources` | Authenticated | Share an Item | Submits a physical tool/item for community borrowing (PENDING approval). |
| `PUT` | `/api/v1/marketplace/resources/{id}` | Owner / Admin | Edit & Resubmit Tool | Updates resource details and automatically resets moderation status back to pending review. |
| `GET` | `/api/v1/marketplace/resources/pending` | Coordinator / Admin | Moderation Queue | Lists shared resource submissions awaiting coordinator approval review. |
| `POST` | `/api/v1/marketplace/resources/{id}/approve` | Coordinator / Admin | Approve Resource | Approves shared item listing for public community borrowing. |
| `POST` | `/api/v1/marketplace/resources/{id}/reject` | Coordinator / Admin | Reject Resource | Rejects shared item submission with mandatory moderation feedback. |
| `POST` | `/api/v1/marketplace/resources/{id}/book` | Authenticated | Borrow Resource | Requests to borrow an item for owner approval. |
| `PATCH` | `/api/v1/marketplace/resources/{id}/availability` | Authenticated (Lender) | Toggle Availability | Updates item availability state (Available / In Use). |

---

### 3.8 Community Events & Volunteering (`/events`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | Authenticated | Events Directory | Fetches upcoming community events with volunteer headcounts and participation status. |
| `POST` | `/api/v1/events` | Coordinator / Admin | Schedule Event | Publishes a new community event (enforces $\ge 2$ active coordinator rule). |
| `PATCH` | `/api/v1/events/{id}` | Coordinator / Admin | Edit Event | Updates event title, description, date, timing, volunteer limits, or theme color. |
| `POST` | `/api/v1/events/{id}/complete` | Coordinator / Admin | Complete Event | Marks an event as completed. |
| `DELETE` | `/api/v1/events/{id}` | Coordinator / Admin | Delete Event | Cancels/deletes an event and cleans up associated volunteer request rosters. |
| `GET` | `/api/v1/events/{id}/volunteer-requests` | Coordinator / Admin | Volunteer Roster | Retrieves all volunteer signup requests for a specific community event. |
| `POST` | `/api/v1/events/{id}/volunteer` | Authenticated | Volunteer Signup | Submits self-nomination request to volunteer for an event (PENDING review). |
| `POST` | `/api/v1/events/{id}/invite` | Coordinator / Admin | Direct Invitation | Sends direct volunteer participation invitation to a specific resident. |
| `POST` | `/api/v1/events/volunteer-requests/{id}/approve` | Coordinator / Admin | Approve Volunteer | Approves volunteer request and adds resident to active roster. |
| `POST` | `/api/v1/events/volunteer-requests/{id}/reject` | Coordinator / Admin | Reject Volunteer | Rejects volunteer signup request. |
| `POST` | `/api/v1/events/volunteer-requests/{id}/withdraw` | Authenticated | Volunteer Withdrawal | Allows a resident to withdraw from an event volunteer roster with a specified reason. |


---

### 3.9 Complaints & Audits Module (`/complaints`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/complaints` | Authenticated | View Complaints Feed | Retrieves facility complaints feed (filters out private complaints for standard users). |
| `POST` | `/api/v1/complaints` | Authenticated | File Complaint | Submits a new facility grievance report with optional anonymity flag (`is_anonymous`). |
| `POST` | `/api/v1/complaints/{id}/resolve` | Admin / Coordinator | Resolve Grievance | Marks complaint resolved with administrative resolution notes. |

---

### 3.10 Notice Board & Messaging Module (`/notices`, `/chat`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notices` | Authenticated | Notice Board Feed | Fetches community announcements sorted chronologically by newest. |
| `POST` | `/api/v1/notices` | Admin / Coordinator | Broadcast Notice | Creates and broadcasts a new community notice announcement. |
| `DELETE` | `/api/v1/notices/{id}` | Admin / Author | Delete Announcement | Deletes a notice announcement (enforces author or admin deletion privileges). |
| `GET` | `/api/v1/chat/messages` | Authenticated | Chat History | Retrieves direct message history between current user and another resident. |
| `POST` | `/api/v1/chat/messages` | Authenticated | Send Message | Sends a real-time direct chat message to another resident. |

---

### 3.11 Google Gemini AI Assistant Module (`/ai`, `/users/me/summary`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ai/chatbot` | Authenticated | AI Smart Assistant | Context-aware AI chatbot answering queries about credits, rules, and notice details. |
| `POST` | `/api/v1/ai/auto-tag` | Public / Auth | Content Auto-Tagging | Uses AI to automatically extract relevant tags and category from listing descriptions. |
| `POST` | `/api/v1/ai/categorize-complaint` | Public / Auth | Priority Classifier | Analyzes complaint text to assign automatic priority level (high, medium, low). |
| `POST` | `/api/v1/ai/verify-id-proof` | Authenticated | Vision ID Check | Performs Vision AI verification on uploaded resident ID document images. |
| `POST` | `/api/v1/ai/find-nearby-societies` | Public / Auth | Society Proximity Finder | Ranks societies by proximity to a given user address text. |
| `POST` | `/api/v1/ai/match-marketplace` | Authenticated | AI Marketplace RAG Search | Semantic RAG matching layman user search intent against live catalog with AI summaries. |
| `GET` | `/api/v1/ai/suggest-volunteers` | Coordinator / Admin | AI Volunteer Matcher | Recommends best resident candidates for event volunteering based on skills. |
| `POST` | `/api/v1/ai/check-event-clash` | Coordinator / Admin | AI Event Clash Detector | Evaluates potential schedule clashes against existing society events and provides alternative timing recommendations. |
| `GET` | `/api/v1/ai/coordinator-event-suggestions` | Coordinator / Admin | AI Community Event Ideas | Generates fresh community engagement event ideas tailored to active resident interest tags and seasonal trends. |
| `GET` | `/api/v1/ai/resident-suggestions` | Authenticated | AI Personalized Recommendations | Computes personalized skill exchange matches and event volunteering opportunities based on survey tags. |
| `GET` | `/api/v1/users/me/summary` | Authenticated | AI Community Digest | Retrieves or asynchronously computes a 2-3 sentence personalized onboarding digest summarizing community value. |
| `POST` | `/api/v1/users/me/survey` | Authenticated | Submit/Update Preferences | Records resident interests, offered skills, and volunteer availability; triggers background AI digest recalculation. |


---

### 3.12 Analytics & Performance Module (`/analytics`, `/health`)
| Method | Endpoint | Roles | User Story | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/owner` | Owner | Ecosystem Analytics | Computes global platform metrics, active society counts, and total credit velocity. |
| `GET` | `/api/v1/analytics/society/{id}` | Admin / Owner | Society Health Dashboard | Computes society capacity metrics, household claim rates, and resolution speed. |
| `GET` | `/health` | Public | System Health | Returns server health status and API readiness flag. |

---

## 4. Complete Test Cases Reference Suite

### 4.1 Authentication Test Cases (`test_auth.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `POST /api/v1/auth/signup` | Valid user payload (Alice, alice@example.com, Password123!) | HTTP 201 Created, user object returned with `role="resident"` | HTTP 201, user registered successfully | **PASS** |
| `POST /api/v1/auth/signup` | Duplicate email address registration attempt | HTTP 400 Bad Request, "Email already registered" | HTTP 400, duplicate email detail returned | **PASS** |
| `POST /api/v1/auth/login` | Valid registered credentials (email, password) | HTTP 200 OK, accessToken and bearer token type returned | HTTP 200, valid token issued | **PASS** |
| `GET /api/v1/auth/me` | Valid Bearer token in Authorization header | HTTP 200 OK, current user profile object returned | HTTP 200, profile data returned successfully | **PASS** |
| `POST /api/v1/users/{id}/promote` | Admin token & target user ID payload | HTTP 200 OK, updated user object with `role="coordinator"` | HTTP 200, user promoted to coordinator | **PASS** |
| `POST /api/v1/auth/forgot-password` | Registered email payload | HTTP 200 OK, recovery message returned | HTTP 200, recovery instructions delivered | **PASS** |
| `POST /api/v1/auth/reset-password` | Matching email, new password, confirmation | HTTP 200 OK, password updated, login with new credentials succeeds | HTTP 200, password updated and verified | **PASS** |
| `GET /health` | Public GET request to health endpoint | HTTP 200 OK, `{"status": "ok"}` returned | HTTP 200, status ok confirmed | **PASS** |

---

### 4.2 Users & Onboarding Module Test Cases (`test_users.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/users/me` | Valid Bearer token session | HTTP 200 OK, resident profile object returned | HTTP 200, profile data returned successfully | **PASS** |
| `PATCH /api/v1/users/me` | Updated name and contact payload | HTTP 200 OK, updated user record returned | HTTP 200, profile record updated | **PASS** |
| `POST /api/v1/users/me/survey` | Valid survey payload (interests, skills_offered, volunteer_interest) | HTTP 200 OK, updated resident profile with saved survey | HTTP 200, survey responses saved | **PASS** |
| `POST /api/v1/users/me/id-proof` | Base64 encoded image string payload | HTTP 200 OK, user object with updated `id_proof_url` | HTTP 200, ID proof URL updated | **PASS** |
| `GET /api/v1/users` | Admin session with `society_id` query parameter | HTTP 200 OK, array of resident user objects | HTTP 200, residents list returned | **PASS** |
| `GET /api/v1/users/coordinators` | Authenticated session with `society_id` query | HTTP 200 OK, array of coordinator users | HTTP 200, coordinators list returned | **PASS** |
| `GET /api/v1/users/{user_id}` | Valid target `user_id` route parameter | HTTP 200 OK, user profile details returned | HTTP 200, target user object returned | **PASS** |
| `POST /api/v1/users/{user_id}/demote` | Admin session demoting coordinator | HTTP 200 OK, updated user role set to resident | HTTP 200, user demoted to resident | **PASS** |
| `POST /api/v1/users/{user_id}/verify-id-proof` | Admin session with verification outcome payload | HTTP 200 OK, verification status confirmed | HTTP 200, ID proof verified | **PASS** |

---

### 4.3 Societies & Onboarding Module Test Cases (`test_societies.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `POST /api/v1/societies/applications` | Valid application details (society_name, address, admin_name) | HTTP 200 OK, proposal logged with status pending | HTTP 200, setup application created | **PASS** |
| `GET /api/v1/societies/applications` | Platform Owner session token | HTTP 200 OK, array of pending society setup requests | HTTP 200, pending applications returned | **PASS** |
| `GET /api/v1/societies/applications/me` | Authenticated founder session | HTTP 200 OK, user's submitted setup application object | HTTP 200, application status returned | **PASS** |
| `DELETE /api/v1/societies/applications/{id}` | Owner session with `application_id` | HTTP 200 OK, application record deleted | HTTP 200, application removed | **PASS** |
| `POST /api/v1/societies/applications/{id}/approve` | Owner session approving pending society application | HTTP 200 OK, provisions invite key & initializes society | HTTP 200, society activated with invite key | **PASS** |
| `POST /api/v1/societies/applications/{id}/reject` | Owner session rejecting application with reason payload | HTTP 200 OK, application status marked rejected with remarks saved | HTTP 200, application marked rejected with reason | **PASS** |
| `POST /api/v1/societies/applications/{id}/resubmit` | Applicant revising details after rejection | HTTP 200 OK, resets application status to pending for re-review | HTTP 200, application resubmitted successfully | **PASS** |
| `GET /api/v1/societies` | Query parameters for active societies search | HTTP 200 OK, list of active society objects | HTTP 200, societies list returned | **PASS** |
| `GET /api/v1/societies/{society_id}` | Valid `society_id` route parameter | HTTP 200 OK, matching society detail object returned | HTTP 200, society profile returned | **PASS** |
| `PATCH /api/v1/societies/{society_id}/config` | Admin session with updated capacity config payload | HTTP 200 OK, updated society configuration returned | HTTP 200, configuration updated | **PASS** |
| `POST /api/v1/societies/{society_id}/suspend` | Owner session suspending society with reason | HTTP 200 OK, society status updated to suspended with lock guard active | HTTP 200, society locked down | **PASS** |
| `POST /api/v1/societies/join-requests` | Resident payload (society_key, unit_number, id_proof) | HTTP 201 Created, join request logged for review | HTTP 201, join request created | **PASS** |
| `POST /api/v1/societies/join-requests/{id}/approve` | Secondary occupant attempting approval on claimed flat | HTTP 403 Forbidden, only primary flat lead or admin authorized | HTTP 403, unauthorized approval blocked | **PASS** |
| `POST /api/v1/societies/join-requests/{id}/approve` | Primary flat lead or admin approving join request | HTTP 200 OK, links flat unit & grants initial credit balance | HTTP 200, resident approved & credited | **PASS** |
| `POST /api/v1/societies/leave` | Resident calling atomic leave endpoint | HTTP 200 OK, unlinks user, unclaims flat, cancels active items | HTTP 200, society vacated cleanly | **PASS** |

---

### 4.4 Household Registry Test Cases (`test_households.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/households` | Query `society_id` parameter | HTTP 200 OK, array of registered household units | HTTP 200, household list returned | **PASS** |
| `POST /api/v1/households` | Admin payload (`unit_number: "Penthouse-1"`) | HTTP 201 Created, single household unit registered | HTTP 201, unit added to registry | **PASS** |
| `POST /api/v1/households/bulk` | Admin range payload (`blocks: ["A"], start_unit: 101, end_unit: 105`) | HTTP 201 Created, batch generation summary response | HTTP 201, 5 units generated | **PASS** |
| `PUT /api/v1/households/{id}` | Admin payload updating unit number | HTTP 200 OK, updated household unit record | HTTP 200, unit number updated | **PASS** |
| `DELETE /api/v1/households/{id}` | Admin deleting unclaimed unit ID | HTTP 200 OK, household card removed from registry | HTTP 200, unit record deleted | **PASS** |
| `DELETE /api/v1/households/society/{id}` | Admin clearing all units for society | HTTP 200 OK, all unassigned households cleared | HTTP 200, registry cleared | **PASS** |

---

### 4.5 Wallet Module Test Cases (`test_wallet.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/wallet/balance` | Authenticated resident session | HTTP 200 OK, returns credit balance and ledger | HTTP 200, balance & ledger returned | **PASS** |
| `GET /api/v1/wallet/transactions` | Authenticated resident session | HTTP 200 OK, chronologically sorted transaction list | HTTP 200, transaction ledger returned | **PASS** |
| `POST /api/v1/wallet/transfer` | Valid transfer payload (recipient_id, amount: 5.0) | HTTP 200 OK, atomic credit transfer executed, dual ledger logged | HTTP 200, credits transferred | **PASS** |
| `POST /api/v1/wallet/transfer` | Transfer amount exceeding current balance | HTTP 400 Bad Request, "Insufficient credit balance" error | HTTP 400, transfer rejected | **PASS** |
| `POST /api/v1/wallet/transfer` | Self-transfer attempt (`recipient_id == sender_id`) | HTTP 400 Bad Request, "Cannot transfer credits to self" | HTTP 400, self-transfer blocked | **PASS** |

---

### 4.6 Marketplace: Skills Exchange Test Cases (`test_marketplace.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/marketplace/skills` | Authenticated resident session query | HTTP 200 OK, returns list containing only approved skills | HTTP 200, approved skills list returned | **PASS** |
| `POST /api/v1/marketplace/skills` | Valid skill payload (title, description, credits) | HTTP 201 Created, returns skill listing with PENDING status | HTTP 201, skill posted for review | **PASS** |
| `POST /api/v1/marketplace/skills/{id}/approve` | Creator coordinator trying to self-approve own skill | HTTP 403 Forbidden, self-approval prevention rule enforced | HTTP 403, self-approval blocked | **PASS** |
| `POST /api/v1/marketplace/skills/{id}/approve` | Independent second coordinator approving skill listing | HTTP 200 OK, skill listing approval status set to approved | HTTP 200, skill approved | **PASS** |
| `POST /api/v1/marketplace/skills/{id}/reject` | Coordinator rejecting listing with empty reason | HTTP 400/422 Unprocessable Entity, mandatory reason required | HTTP 422, empty rejection blocked | **PASS** |
| `POST /api/v1/marketplace/skills/{id}/reject` | Coordinator rejecting listing with valid feedback reason | HTTP 200 OK, status set to rejected and feedback stored | HTTP 200, skill rejected with remarks | **PASS** |
| `PUT /api/v1/marketplace/skills/{id}` | Resident updating rejected listing details | HTTP 200 OK, applies edits and shifts status back to pending | HTTP 200, revised and resubmitted | **PASS** |
| `POST /api/v1/marketplace/skills/{id}/book` | Valid approved skill ID with buyer having balance | HTTP 200 OK, booking created; on owner approval debits buyer & credits provider | HTTP 200, booking and credits processed | **PASS** |

---

### 4.7 Marketplace: Shared Resources Test Cases (`test_resources.py` / `test_marketplace.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/marketplace/resources` | Authenticated resident session query | HTTP 200 OK, returns list of approved available shared tools | HTTP 200, resources list returned | **PASS** |
| `POST /api/v1/marketplace/resources` | Valid resource payload (name, category, credits) | HTTP 201 Created, returns resource with PENDING status | HTTP 201, resource posted | **PASS** |
| `POST /api/v1/marketplace/resources/{id}/approve` | Coordinator approving shared resource submission | HTTP 200 OK, resource approved for borrowing | HTTP 200, resource approved | **PASS** |
| `POST /api/v1/marketplace/resources/{id}/reject` | Coordinator rejecting shared resource with reason | HTTP 200 OK, resource status set to rejected and feedback saved | HTTP 200, resource rejected with remarks | **PASS** |
| `PUT /api/v1/marketplace/resources/{id}` | Resident updating rejected resource | HTTP 200 OK, applies edits, resets status to pending | HTTP 200, revised and resubmitted | **PASS** |
| `POST /api/v1/marketplace/resources/{id}/book` | Valid available resource ID with buyer having balance | HTTP 200 OK, booking created; on approval marks unavailable | HTTP 200, resource borrowed | **PASS** |
| `PATCH /api/v1/marketplace/resources/{id}/availability` | Lender updating resource availability payload | HTTP 200 OK, updated resource object returned | HTTP 200, availability updated | **PASS** |

---

### 4.8 Community Events & Volunteering Test Cases (`test_events.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/events` | Authenticated resident session query | HTTP 200 OK, returns upcoming community events list | HTTP 200, events directory returned | **PASS** |
| `POST /api/v1/events` | Event creation in society with $<2$ active coordinators | HTTP 400 Bad Request, "Society must have at least 2 coordinators" | HTTP 400, operational rule enforced | **PASS** |
| `GET /api/v1/events/{id}/volunteer-requests` | Coordinator session with `event_id` | HTTP 200 OK, returns array of volunteer signups | HTTP 200, volunteer requests returned | **PASS** |
| `POST /api/v1/events/{id}/volunteer` | Valid upcoming event ID | HTTP 200 OK, submits self-nomination & records PENDING status | HTTP 200, volunteer request logged | **PASS** |
| `POST /api/v1/events/{id}/invite` | Coordinator token & target resident ID | HTTP 200 OK, direct participation invitation sent | HTTP 200, invitation sent | **PASS** |
| `POST /api/v1/events/volunteer-requests/{id}/approve` | Coordinator approving volunteer signup | HTTP 200 OK, volunteer status set to approved | HTTP 200, volunteer approved | **PASS** |
| `POST /api/v1/events/volunteer-requests/{id}/reject` | Coordinator rejecting volunteer signup with optional rejection reason | HTTP 200 OK, volunteer status set to rejected and saves rejectionReason | HTTP 200, volunteer rejected with reason | **PASS** |
| `POST /api/v1/events/{id}/invite` (Re-invite) | Coordinator re-inviting previously declined volunteer | HTTP 201 Created, resets status to pending and clears previous rejection reason | HTTP 201, volunteer re-invited | **PASS** |
| `POST /api/v1/events/volunteer-requests/{id}/withdraw` | Valid event ID and `reason_for_leaving` payload | HTTP 200 OK, updates status to WITHDRAWN and saves reason | HTTP 200, withdrawal processed | **PASS** |
| `PATCH /api/v1/events/{id}` | Coordinator updating event title, date, capacity, theme | HTTP 200 OK, returns updated event with new details | HTTP 200, event modified | **PASS** |
| `POST /api/v1/events/{id}/complete` | Coordinator completing active event | HTTP 200 OK, event status updated to COMPLETED | HTTP 200, event marked completed | **PASS** |
| `DELETE /api/v1/events/{id}` | Coordinator canceling event | HTTP 200 OK, deletes event and cleans up volunteer assignments | HTTP 200, event deleted | **PASS** |



---

### 4.9 Complaints & Auditing Test Cases (`test_complaints.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/complaints` | Authenticated resident session query | HTTP 200 OK, returns public complaints (hides neighbor's private) | HTTP 200, complaints feed returned | **PASS** |
| `POST /api/v1/complaints` | Valid complaint payload (title, category, description, is_anonymous) | HTTP 201 Created, registers standard complaint with OPEN status | HTTP 201, complaint filed | **PASS** |
| `POST /api/v1/complaints/{id}/resolve` | Admin session with resolution note payload | HTTP 200 OK, updates status to resolved and saves resolution note | HTTP 200, complaint resolved | **PASS** |

---

### 4.10 Notice Board & Direct Messaging Test Cases (`test_chat_and_notices.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/notices` | Authenticated resident session query | HTTP 200 OK, returns chronological feed of notices | HTTP 200, notices feed returned | **PASS** |
| `POST /api/v1/notices` | Valid notice payload (title, content, category) | HTTP 201 Created, broadcasts new notice announcement | HTTP 201, notice published | **PASS** |
| `DELETE /api/v1/notices/{id}` | Valid notice ID belonging to author or admin | HTTP 200 OK, deletes notice record from database | HTTP 200, notice deleted | **PASS** |
| `GET /api/v1/chat/messages` | Authenticated session with `other_user_id` query | HTTP 200 OK, returns direct chat message history | HTTP 200, chat history returned | **PASS** |
| `POST /api/v1/chat/messages` | Resident payload (receiver_id, content: "Hello neighbor") | HTTP 201 Created, message sent & saved to database | HTTP 201, message delivered | **PASS** |

---

### 4.11 Google Gemini AI Smart Assistant Test Cases (`test_ai.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `POST /api/v1/ai/chatbot` | Authenticated query (message: "What is my credit balance?") | HTTP 200 OK, returns contextual response explaining credits | HTTP 200, AI response generated | **PASS** |
| `POST /api/v1/ai/auto-tag` | Query payload (text: "Acoustic guitar and music lessons") | HTTP 200 OK, category extracted and relevant tags returned | HTTP 200 OK, category and tags returned | **PASS** |
| `POST /api/v1/ai/categorize-complaint` | Query payload (text: "Dangerous threat and safety issue") | HTTP 200 OK, returns priority score `priority="high"` | HTTP 200, high priority assigned | **PASS** |
| `POST /api/v1/ai/verify-id-proof` | Query payload (image_url, user_name: "Alice") | HTTP 200 OK, vision AI verification result object | HTTP 200, ID proof verified | **PASS** |
| `POST /api/v1/ai/find-nearby-societies` | Query payload (address: "MG Road area") | HTTP 200 OK, array of nearby societies ranked by proximity | HTTP 200, nearby societies returned | **PASS** |
| `POST /api/v1/ai/match-marketplace` | Layman natural language query (e.g. "teach coding basics") | HTTP 200 OK, returns matched items with AI summary and intent tags | HTTP 200, RAG items and summaries returned | **PASS** |
| `GET /api/v1/ai/suggest-volunteers` | Coordinator session with `event_id` query | HTTP 200 OK, returns AI-recommended resident candidates | HTTP 200, candidate suggestions returned | **PASS** |

---

### 4.12 Analytics & Performance Test Cases (`test_analytics.py`)
| API Tested | Inputs | Expected Output | Actual Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| `GET /api/v1/analytics/owner` | Platform Owner session token | HTTP 200 OK, returns cross-society KPIs & circulating volume | HTTP 200, owner metrics returned | **PASS** |
| `GET /api/v1/analytics/society/{id}` | Admin session with `society_id` | HTTP 200 OK, returns society capacity metrics & claim rates | HTTP 200, society analytics returned | **PASS** |

---

## 5. Deferred / Roadmap Items (Feature 5)

| Feature | Scope & Remaining Work |
| :--- | :--- |
| **Feature 5: Dynamic User Identity Verification Status** | **Requirements:**<br>1. *User Profile Photo Upload Visibility:* Enable residents to upload government verification document / photo from their profile, persisting Base64/URL and displaying verification state (`Unverified` / `Pending Verification` / `Verified`).<br>2. *Coordinator / Admin Verification Dashboard:* Enable coordinators and admins to view the uploaded proof photo in the resident directory and approve/reject verification status.<br>3. *Status:* Postponed by user request during previous session; ready to implement upon your signal. |

---

## 6. Resuming Work on Any Day

### If Reopening This Exact Session:
- Simply post your next instruction or request (e.g. *"Let's build Feature 5"* or *"Proceed to Feature 11"*).

### If Starting a Brand New Chat Session:
1. All changes are permanently pushed to branch **`feature/cen-updates`**.
2. Reference this conversation link:
   [Previous Session Checkpoint](conversation://08bab184-8aff-4492-b886-7039d0a841d7)
3. You can paste:
   > *"We have completed Features 1–4 and 6–10 on branch `feature/cen-updates` (all 47 tests passing). Let's implement Feature 5 (Dynamic User Identity Verification Status) or proceed with the next feature."*
