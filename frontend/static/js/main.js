// ---------------- Common Views ----------------

import IndexPage from "./views/IndexPage.js";
import LoginView from "./views/LoginView.js";
import RegisterView from "./views/RegisterView.js";

// ---------------- Resident Views ----------------

import ResidentDashboard from "./views/ResidentDashboard.js";
import CommunityEvents from "./views/CommunityEvents.js";
import Events from "./views/Events.js"
import EventDetails from "./views/EventDetails.js";
import CommunityResources from "./views/Resources.js";
import ResourceDetails from "./views/ResourceDetails.js";
import VolunteerActivities from "./views/VolunteerActivities.js";
import CommunitySkills from "./views/Skills.js";
import CreditWallet from "./views/Wallet.js";
import ResidentProfile from "./views/Profile.js";

// ---------------- Admin Views ----------------

import AdminDashboard from "./views/AdminDashboard.js";
import Residents from "./views/Residents.js";
import CommunityEventsAdmin from "./views/CommunityEventsAdmin.js";
import CommunityResourcesAdmin from "./views/CommunityResources.js";
import CommunitySkillsAdmin from "./views/CommunitySkills.js";
import VolunteerManagement from "./views/VolunteerManagement.js";
import CreditAnalytics from "./views/CreditAnalytics.js";
import Reports from "./views/Reports.js";
import Settings from "./views/Settings.js";

// ---------------- Resource Owner Views ----------------

import ResourceOwnerDashboard from "./views/ResourceOwnerDashboard.js";
import MyResources from "./views/MyResources.js";
import AddResource from "./views/AddResource.js";
import BorrowRequests from "./views/BorrowRequests.js";
import ResourceHistory from "./views/ResourceHistory.js";

// ---------------- Skill Provider Views ----------------

import SkillProviderDashboard from "./views/SkillProviderDashboard.js";
import MySkills from "./views/MySkills.js";
import AddSkill from "./views/AddSkill.js";
import Bookings from "./views/Bookings.js";
import TeachingHistory from "./views/TeachingHistory.js";


// ---------------- Axios Interceptor ----------------

axios.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});


// ---------------- Routes ----------------

const routes = {

    // Common
    "": IndexPage,
    "#/": IndexPage,
    "#/login": LoginView,
    "#/register": RegisterView,

    // Resident
    "#/resident": ResidentDashboard,
    "#/resident/events": Events,
    "#/resident/event": EventDetails,
    "#/resident/resources": CommunityResources,
    "#/resident/resource": ResourceDetails,
    "#/resident/volunteers": VolunteerActivities,
    "#/resident/skills": CommunitySkills,
    "#/resident/wallet": CreditWallet,
    "#/resident/profile": ResidentProfile,

    // Admin
    "#/admin": AdminDashboard,
    "#/admin/residents": Residents,
    "#/admin/events": CommunityEventsAdmin,
    "#/admin/resources": CommunityResourcesAdmin,
    "#/admin/skills": CommunitySkillsAdmin,
    "#/admin/volunteers": VolunteerManagement,
    "#/admin/analytics": CreditAnalytics,
    "#/admin/reports": Reports,
    "#/admin/settings": Settings,

    // Resource Owner
    "#/owner": ResourceOwnerDashboard,
    "#/owner/resources": MyResources,
    "#/owner/add-resource": AddResource,
    "#/owner/requests": BorrowRequests,
    "#/owner/history": ResourceHistory,

    // Skill Provider
    "#/provider": SkillProviderDashboard,
    "#/provider/skills": MySkills,
    "#/provider/add-skill": AddSkill,
    "#/provider/bookings": Bookings,
    "#/provider/history": TeachingHistory

};


// ---------------- Vue App ----------------

const app = Vue.createApp({

    data() {

        return {

            currentView: IndexPage

        };

    },

    created() {

        this.loadView();

        window.addEventListener(
            "hashchange",
            this.loadView
        );

    },

    methods: {

        loadView() {

            this.currentView =
                routes[window.location.hash] || IndexPage;

        }

    }

});


// ---------------- Mount ----------------

app.mount("#app");