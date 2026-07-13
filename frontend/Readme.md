# Community Exchange Network (CEN)

## Milestone 2 - Frontend UI

This project is developed as part of the Software Engineering course.

The Community Exchange Network (CEN) is a web application that enables residents to share resources, offer skills, volunteer in community activities, and earn community credits. The application also provides dashboards for Resource Owners, Skill Providers, and Administrators.

**Note:**  
This submission contains only the frontend implementation using Vue.js (CDN). Backend APIs are not integrated in this milestone. All data displayed in the application is dummy data.

---

## Technologies Used

- HTML5
- Bootstrap 5
- JavaScript (ES6 Modules)
- Vue.js 3 (CDN)
- Axios
- Chart.js

---

## Folder Structure

```
frontend/
│
├── templates/
│   └── index.html
│
├── static/
│   └── js/
│       ├── main.js
│       └── views/
│           ├── IndexPage.js
│           ├── LoginView.js
│           ├── RegisterView.js
│           ├── ...
│
└── README.md
```

---

## User Roles

The application contains four user roles:

- Resident
- Resource Owner
- Skill Provider
- Admin

Each role has its own dashboard and related pages.

---

## Features

### Resident

- Login
- Register
- Dashboard
- Browse Community Events
- View Event Details
- Browse Resources
- View Resource Details
- Volunteer Activities
- Community Skills
- Credit Wallet
- Profile

### Resource Owner

- Dashboard
- Manage Resources
- Add Resource
- Borrow Requests
- Borrow History

### Skill Provider

- Dashboard
- Manage Skills
- Add Skill
- Bookings
- Teaching History

### Admin

- Dashboard
- Manage Residents
- Manage Community Events
- Manage Resources
- Manage Skills
- Volunteer Management
- Community Analytics
- Reports
- Settings

---

## How to Run

### Option 1 (Recommended)

Open the project in Visual Studio Code.

Install the **Live Server** extension.

Open:

```
templates/index.html
```

Right-click and select:

```
Open with Live Server
```

The application will open automatically in your browser.

---


## Navigation

Navigation is implemented using Vue.js and Hash Routing.

Example routes:

```
#/login

#/register

#/resident

#/resident/events

#/resident/resources

#/owner

#/provider

#/admin
```

---

## Important Notes

- No backend integration is included.
- No database is used in this milestone.
- All information displayed is dummy data.
- Buttons perform UI-only actions.
- Charts are created using Chart.js.
- Routing is handled using Vue.js components.

---

## Developed For

Software Engineering Project

Milestone 2

Frontend UI Prototype