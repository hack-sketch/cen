# Proposed Methodology — System Diagrams

---

## Figure 1: Three-Layer System Architecture

```mermaid
graph TD
    subgraph CLIENT["🖥️ Frontend Presentation Layer"]
        R["React 19 + TypeScript + Vite"]
        TR["TanStack Router\n(File-based type-safe routing)"]
        TQ["TanStack Query\n(Server-state caching & sync)"]
        TW["TailwindCSS v4\n+ Radix UI Primitives"]
        R --> TR
        R --> TQ
        R --> TW
    end

    subgraph BACKEND["⚙️ Backend API Gateway Layer"]
        FA["FastAPI (Python 3.12)\nAsync Request Handlers"]
        PV["Pydantic v2\nPayload Validation"]
        JWT["JWT + passlib/bcrypt\nStateless Auth"]
        FA --> PV
        FA --> JWT
    end

    subgraph DB["🗄️ Persistence & ORM Layer"]
        ORM["SQLAlchemy 2.0 ORM"]
        SQ["SQLite\n(Development)"]
        PG["PostgreSQL\n(Production-ready)"]
        ORM --> SQ
        ORM --> PG
    end

    CLIENT -- "HTTPS REST API Calls" --> BACKEND
    BACKEND -- "ORM Queries" --> DB

    style CLIENT fill:#dbeafe,stroke:#3b82f6,color:#000
    style BACKEND fill:#dcfce7,stroke:#22c55e,color:#000
    style DB fill:#fef9c3,stroke:#eab308,color:#000
```

---

## Figure 2: Four-Tier Role-Based Access Control (RBAC) Matrix

```mermaid
graph TD
    PO["👑 Platform Owner (Root)\n─────────────────────────\n• Ecosystem health oversight\n• Society onboarding approval\n• Cross-community metrics\n• Community suspension / lockdown"]
    SA["🏛️ Society Admin\n─────────────────────────\n• Building layout management\n• Bulk household unit generation\n• Credit rule configuration\n• Coordinator appointment"]
    CO["🛡️ Coordinator\n─────────────────────────\n• Skill & resource listing review\n• Volunteer roster moderation\n• Event scheduling\n• Trade dispute arbitration"]
    VR["🏠 Verified Resident\n─────────────────────────\n• Community credit transactions\n• Skill & tool listings\n• Event volunteering\n• Facility grievance filing"]

    PO -- "Delegates authority to" --> SA
    SA -- "Appoints & manages" --> CO
    CO -- "Moderates activities of" --> VR

    style PO fill:#fde8e8,stroke:#dc2626,color:#000
    style SA fill:#fef3c7,stroke:#d97706,color:#000
    style CO fill:#dbeafe,stroke:#2563eb,color:#000
    style VR fill:#dcfce7,stroke:#16a34a,color:#000
```

---

## Figure 3: Modular Workflow and Data Flow

```mermaid
flowchart LR
    subgraph OB["📋 Onboarding & Verification"]
        direction TB
        U1["Resident enters\nSociety Key"]
        U2["Selects unclaimed\nhousehold flat slot"]
        U3["Uploads Govt ID\ndocumentation"]
        U4{"Admin / Flat Lead\nApproval"}
        U5["Initial Community\nCredits Granted ✅"]
        U6["Request Rejected ❌"]
        U1 --> U2 --> U3 --> U4
        U4 -- "Approved" --> U5
        U4 -- "Rejected" --> U6
    end

    subgraph PE["🔄 Peer Exchange & Escrow"]
        direction TB
        P1["Provider lists Skill\nor Tool with credit cost\n& photo attachments"]
        P2["Enters Coordinator\nReview Queue"]
        P3{"Coordinator\nDecision"}
        P4["Listing visible\nto community ✅"]
        P5["Structured feedback\nsent to provider"]
        P6["Provider revises\n& resubmits"]
        P1 --> P2 --> P3
        P3 -- "Approved" --> P4
        P3 -- "Rejected" --> P5 --> P6 --> P2
    end

    subgraph EC["📅 Event Coordination"]
        direction TB
        E1["Coordinator publishes\ncommunity event"]
        E2["Residents register\nas volunteers"]
        E3["Coordinator manages\ncapacity & invites"]
        E4["Withdrawal reasons\nrecorded"]
        E1 --> E2 --> E3
        E3 --> E4
    end

    OB --> PE
    PE --> EC

    style OB fill:#ede9fe,stroke:#7c3aed,color:#000
    style PE fill:#fce7f3,stroke:#db2777,color:#000
    style EC fill:#e0f2fe,stroke:#0284c7,color:#000
```

---

## Figure 4: Complete System Data Flow (End-to-End Overview)

```mermaid
sequenceDiagram
    actor Resident as 🏠 Resident
    actor Coordinator as 🛡️ Coordinator
    actor Admin as 🏛️ Society Admin
    participant FE as Frontend (React)
    participant API as Backend (FastAPI)
    participant DB as Database (SQLAlchemy)

    Note over Resident,DB: Onboarding Flow
    Resident->>FE: Enter society key + select flat
    FE->>API: POST /onboard {key, flat, id_doc}
    API->>DB: Create pending resident record
    Admin->>API: PATCH /residents/{id}/approve
    API->>DB: Update status + grant credits
    API-->>Resident: Welcome + credit balance

    Note over Resident,DB: Peer Exchange Flow
    Resident->>FE: Create skill/tool listing
    FE->>API: POST /listings {title, credits, image}
    API->>DB: Save listing (status=pending)
    Coordinator->>API: PATCH /listings/{id}/approve
    API->>DB: Update listing status=active
    API-->>Resident: Listing is now live

    Note over Resident,DB: Credit Transaction Flow
    Resident->>FE: Request a skill/tool
    FE->>API: POST /transactions {listing_id}
    API->>DB: Debit buyer, credit provider (escrow)
    API-->>Resident: Transaction confirmed ✅
```
