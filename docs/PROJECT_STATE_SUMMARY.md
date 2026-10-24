# CEN Community Platform — Master State & Context Summary

**Last Updated**: August 24, 2026  
**Status**: 🟢 Stable · 53/53 Backend Pytest Tests Passing (100%) · 0 Frontend TypeScript Errors · Clean Build

---

## 📑 1. Key Deliverables & Artifacts Generated

| Deliverable File | Format | Contents & Purpose |
| :--- | :---: | :--- |
| [`PostM4_Updates_Team094.docx`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/PostM4_Updates_Team094.docx) | `.docx` | Comprehensive report detailing all 18 commits / 12 post-M4 feature updates with git hashes, test cases, and code changes. |
| [`M5_ImplDetails_CodeReview_Team094.docx`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/M5_ImplDetails_CodeReview_Team094.docx) | `.docx` | Complete Milestone 5 submission: Tech stack (Python 3.12, React 19, Vite 8, Gemini 2.5), step-by-step run instructions, code review guidelines, issue tracking lifecycle, and 9 labelled screenshot placeholder boxes. |
| [`CEN_Presentation_Team094.pptx`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/CEN_Presentation_Team094.pptx) | `.pptx` | 11-Slide pitch presentation with deep forest/violet/amber styling, accurate community credit terminology, all 8 Gemini AI features, 4-tier RBAC, and verified engineering metrics. |
| [`api-doc.yaml`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/api-doc.yaml) & [`swagger.yaml`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/swagger.yaml) | `.yaml` | OpenAPI 3.0.3 specification covering 12 modules, 45+ endpoints, RFC-7807 error schemas, and `[US-01]` through `[US-10]` SMART user story mappings. |

---

## 🛠️ 2. Recent Bugfixes & Optimizations

### ID Verification Modal & UI Lag Resolution (Fix for `UPLOAD_DOC_ERROR.png`)
* **Problem**: Uploading ID photos assigned raw Base64 Data URIs (~500,000 chars) to `docName`, which rendered directly as a DOM text node. This caused browser layout freezing and visual modal clipping.
* **Solution**:
  - Created [`formatDocFilename`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/frontend/src/lib/utils.ts) in `frontend/src/lib/utils.ts` to convert Data URIs/mock paths into clean labels (e.g., `Uploaded_ID_Photo.jpg`, `Uploaded_ID_Proof.pdf`).
  - Updated [`app.profile.tsx`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/frontend/src/routes/app.profile.tsx) `IdProofUploadDialog` with thumbnail preview, truncated labels, and scrollable container.
  - Sanitized inspection dialogs across [`app.dashboard.tsx`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/frontend/src/routes/app.dashboard.tsx), [`app.admin.residents.tsx`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/frontend/src/routes/app.admin.residents.tsx), and [`app.admin.onboarding.tsx`](file:///C:/Users/MSI-1/Downloads/cen-updated/MAY2026-Team-094/frontend/src/routes/app.admin.onboarding.tsx).
  - Verified: `npx tsc --noEmit` $\rightarrow$ 0 errors; `pytest` $\rightarrow$ 53/53 passed.

---

## 🏛️ 3. Governance & Architectural Model Summary

### Administrative Persona vs. Resident Persona
* **Admin Account** (`admin@greenwood.com`): Represents the **Official Society / RWA Desk**. It is non-residential, manages infrastructure (flats, capacity caps, coordinator promotion), and does not participate in peer credit trading.
* **Resident Account** (`resident@cen.app`): Represents the individual resident tied to a specific flat unit (e.g. Unit 101), holding time-credits, skills, and private messages.
* **Leave Society Lifecycle**: When an admin/coordinator/resident vacates, their flat slot is freed (`claimed = False`), local privileges reset, but their credentials and wallet credits remain preserved.
* **Decentralized Operation**: Coordinators handle daily listings, events, join requests, and disputes, ensuring the community never freezes if an administrator relocates.

---

## 🎬 4. Demo Walkthrough Strategy (5-Act Flow)

1. **Act 1: Resident & AI** — Login `resident@cen.app` / `password123`. Show wallet balance, photo lightbox on resource cards, Gemini RAG search (*"fix leaky pipe"*), universal listing edit, and 7-day weekly calendar.
2. **Act 2: Coordinator Moderation & AI Matchmaker** — Login `coord@cen.app` / `password123`. Review pending items in lightbox, test reject-with-reason chips, open event $\rightarrow$ trigger **AI Volunteer Matchmaker** (62%–98% matches), and clash detection.
3. **Act 3: RBAC, ID Verification & Disputes** — Show resident ID upload badge lifecycle (*Unverified* $\rightarrow$ *Pending* $\rightarrow$ *Verified*), Primary Lead household join gating, and dual-party dispute arbitration.
4. **Act 4: Platform Owner Oversight** — Login `owner@cen.app` / `password123`. Show cross-community user directory, platform KPIs, and Society Suspension Lockdown Guard.
5. **Act 5: Technical Proof** — Swagger UI at `http://127.0.0.1:8000/docs`, `pytest` 53/53 passed, `tsc --noEmit` 0 errors.

---

## 🧪 5. Verified Test Baseline

| Suite | Status | Details |
| :--- | :---: | :--- |
| **Backend Tests (Pytest)** | **53 / 53 (100%)** | `.\venv\Scripts\python run_tests.py` passing in ~48s |
| **Frontend Typecheck** | **0 Errors (100%)** | `npx tsc --noEmit` passing with clean exit |
| **OpenAPI Specification** | **Valid (100%)** | Fully parseable by PyYAML and Swagger Editor |
