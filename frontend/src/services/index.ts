// ============================================================================
// SERVICE LAYER — Professional Integration Layer connected to FastAPI Backend
// (http://127.0.0.1:8000/api/v1). Features graceful fallback if backend is offline.
// ============================================================================

import * as mock from "@/mocks/data";
import { apiFetch, clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from "./apiClient";


const delay = <T>(v: T, ms = 0): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(v), ms));

// In-memory mutable state fallback for offline dev mode
const state = {
  users: [...mock.users],
  societies: [...mock.societies],
  households: [...mock.households],
  applications: [...mock.societyApplications],
  joinRequests: [...mock.joinRequests],
  skills: [...mock.skills],
  resources: [...mock.resources],
  transactions: [...mock.transactions],
  events: [...mock.events],
  volunteerRequests: [...mock.volunteerRequests],
  complaints: [...mock.complaints],
  notices: [...mock.notices],
  chat: [...mock.chatMessages],
  exchangeBookings: [] as any[],
};

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------- Auth ----------------
export const authService = {
  login: async (email: string, password: string = "password123") => {
    try {
      const res = await apiFetch<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res && res.user) {
        if (res.user.isActive === false) {
          throw new Error("Your account has been deactivated. Please contact your society administration.");
        }
        const token = res.accessToken || res.access_token;
        setStoredAuth(token, res.user);
        return res.user;
      }
    } catch (err: any) {
      if (err.message) throw err;
    }
    const user = state.users.find((u) => u.email === email);
    if (user) {
      if (user.isActive === false) {
        throw new Error("Your account has been deactivated. Please contact your society administration.");
      }
      setStoredAuth("mock-token-123", user);
    }
    return delay(user ?? null);
  },
  signup: async (name: string, email: string, password: string = "password123") => {
    try {
      const res = await apiFetch<any>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      if (res && res.user) {
        const token = res.accessToken || res.access_token;
        setStoredAuth(token, res.user);
        return res.user;
      }
    } catch (err: any) {
      if (err.message) throw err;
    }
    const u: mock.User = {
      id: uid("u"),
      name,
      email,
      role: "resident",
      creditBalance: 10,
      joinedDate: new Date().toISOString().slice(0, 10),
      idProofUploaded: false,
      isCoordinator: false,
      hasCompletedSurvey: false,
    };
    state.users.push(u);
    setStoredAuth("mock-token-123", u);
    return delay(u);
  },
  logout: async () => {
    clearStoredAuth();
    return delay(true);
  },
  getUserById: async (id: string) => {
    try {
      const res = await apiFetch<any>("/users/me");
      if (res) {
        if (res.isActive === false) {
          throw new Error("Your account has been deactivated. Please contact your society administration.");
        }
        return res;
      }
    } catch (err: any) {
      if (err.message && err.message.includes("deactivated")) throw err;
    }
    const u = state.users.find((u) => u.id === id);
    if (u && u.isActive === false) {
      throw new Error("Your account has been deactivated. Please contact your society administration.");
    }
    return delay(u ?? null);
  },
  forgotPassword: async (email: string) => {
    try {
      const res = await apiFetch<{ message: string; email: string; status: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (res) return res;
    } catch (err: any) {
      console.warn("[Auth API Notice] forgotPassword fallback:", err);
    }
    return delay({
      message: "If an account exists with this email address, password reset instructions have been dispatched.",
      email,
      status: "success",
    }, 400);
  },
  resetPassword: async (email: string, newPassword: string) => {
    try {
      const res = await apiFetch<{ message: string; email: string; status: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, newPassword }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    // In-memory fallback: check if user exists in state
    const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error("No registered account found with this email address.");
    }
    return delay({
      message: "Password updated successfully. You can now log in with your new password.",
      email,
      status: "success",
    }, 400);
  },
};



// ---------------- Societies ----------------
export const societyService = {
  list: async (search?: string) => {
    try {
      const url = search ? `/societies?name=${encodeURIComponent(search)}` : "/societies";
      const res = await apiFetch<any[]>(url);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] list societies fallback:", err);
    }
    let list = state.societies;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }
    return delay(list);
  },
  getById: async (id: string) => {
    try {
      const res = await apiFetch<any>(`/societies/${id}`);
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] getById society fallback:", err);
    }
    return delay(state.societies.find((s) => s.id === id) ?? null);
  },
  submitApplication: async (a: any) => {
    try {
      const res = await apiFetch<any>("/societies/applications", {
        method: "POST",
        body: JSON.stringify({
          societyName: a.societyName,
          type: a.type || "Residential Apartment",
          address: a.address,
          applicantName: a.applicantName || "Applicant",
          applicantContact: a.applicantContact,
          reason: a.reason || "Request to create society network",
          residentCount: Number(a.residentCount) || Number(a.estimatedCap) || 100,
          membersPerHousehold: Number(a.membersPerHousehold) || 4,
          initialCredits: Number(a.initialCredits) || 10,
        }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const app: mock.SocietyApplication = {
      ...a,
      id: uid("app"),
      membersPerHousehold: Number(a.membersPerHousehold) || 4,
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    state.applications.push(app);
    return delay(app);
  },
  listApplications: async () => {
    try {
      const res = await apiFetch<any[]>("/societies/applications");
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listApplications fallback:", err);
    }
    return delay(state.applications);
  },
  approveApplication: async (id: string, capacity: number, initialCredits: number = 10, membersPerHousehold?: number) => {
    try {
      const res = await apiFetch<any>(`/societies/applications/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ capacity, initialCredits, membersPerHousehold }),
      });
      if (res) return true;
    } catch (err) {
      console.warn("[API Notice] approveApplication fallback:", err);
    }
    const a = state.applications.find((x) => x.id === id);
    if (a) {
      a.status = "approved";
      const socId = uid("soc");
      const applicantUser = state.users.find((u) => u.email.toLowerCase() === a.applicantContact.toLowerCase());
      const adminId = applicantUser ? applicantUser.id : uid("u");
      if (applicantUser) {
        applicantUser.role = "admin";
        applicantUser.societyId = socId;
      }
      const newSoc: mock.Society = {
        id: socId,
        name: a.societyName,
        type: a.type,
        address: a.address,
        latitude: 12.97,
        longitude: 77.59,
        adminId: adminId,
        capacity: capacity,
        membersPerHousehold: membersPerHousehold || a.membersPerHousehold || 4,
        initialCredits: initialCredits,
        householdRangeStart: 1,
        householdRangeEnd: capacity,
        coordinatorCount: 0,
        status: "active",
        performanceScore: 100,
        key: a.societyName.toUpperCase().slice(0, 4) + "-" + uid("k").toUpperCase().slice(0, 4),
      };
      state.societies.push(newSoc);
    }
    return delay(true);
  },
  updateSocietyConfig: async (id: string, config: { capacity?: number; initialCredits?: number }) => {
    try {
      const res = await apiFetch<any>(`/societies/${id}/config`, {
        method: "PATCH",
        body: JSON.stringify(config),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] updateSocietyConfig fallback:", err);
    }
    const s = state.societies.find((x) => x.id === id);
    if (s) {
      if (config.capacity !== undefined) s.capacity = config.capacity;
      if (config.initialCredits !== undefined) s.initialCredits = config.initialCredits;
    }
    return delay(s ?? null);
  },
  rejectApplication: async (id: string, rejectionReason?: string) => {
    try {
      await apiFetch<any>(`/societies/applications/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
      });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const a = state.applications.find((x) => x.id === id);
    if (a) {
      a.status = "rejected";
      a.rejectionReason = rejectionReason || "Application did not meet community network eligibility requirements.";
    }
    return delay(true);
  },

  suspend: async (id: string, reason?: string) => {
    try {
      await apiFetch<any>(`/societies/${id}/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      return true;
    } catch (err) {
      console.warn("[API Notice] suspend fallback:", err);
    }
    const s = state.societies.find((x) => x.id === id);
    if (s) {
      s.status = "suspended";
      (s as any).suspensionReason = reason || "Suspended by platform authority.";
    }
    return delay(true);
  },
  revokeSuspension: async (id: string) => {
    try {
      await apiFetch<any>(`/societies/${id}/revoke-suspension`, { method: "POST" });
      return true;
    } catch (err) {
      console.warn("[API Notice] revokeSuspension fallback:", err);
    }
    const s = state.societies.find((x) => x.id === id);
    if (s) {
      s.status = "active";
      (s as any).suspensionReason = undefined;
      (s as any).suspensionAppeal = undefined;
    }
    return delay(true);
  },
  appealSuspension: async (id: string, appealReason: string) => {
    try {
      const res = await apiFetch<any>(`/societies/${id}/appeal-suspension`, {
        method: "POST",
        body: JSON.stringify({ appealReason }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const s = state.societies.find((x) => x.id === id);
    if (s) {
      (s as any).suspensionAppeal = appealReason;
      (s as any).suspensionAppealDate = new Date().toISOString().slice(0, 10);
    }
    return delay(s ?? true);
  },

  getApplicationByEmail: async (email: string) => {
    try {
      const res = await apiFetch<any>("/societies/applications/me");
      if (res) return res;
    } catch (err: any) {
      if (err.message && !err.message.includes("404") && !err.message.includes("No active")) {
        console.warn("[API Notice] getApplicationByEmail fallback:", err);
      }
    }
    return delay(state.applications.find((a) => a.applicantContact.toLowerCase() === email.toLowerCase()) ?? null);
  },
  deleteApplication: async (id: string) => {
    try {
      await apiFetch<any>(`/societies/applications/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[API Notice] deleteApplication fallback:", err);
    }
    const idx = state.applications.findIndex((x) => x.id === id);
    if (idx !== -1) state.applications.splice(idx, 1);
    return delay(true);
  },
};

// ---------------- Households ----------------
export const householdService = {
  listBySociety: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/households?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listBySociety households fallback:", err);
    }
    return delay(state.households.filter((h) => h.societyId === societyId));
  },
  register: async (societyId: string, unitNumber: string) => {
    try {
      const res = await apiFetch<any>("/households", {
        method: "POST",
        body: JSON.stringify({ societyId, unitNumber }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const trimmed = unitNumber.trim();
    const h: mock.Household = { id: uid("h"), societyId, unitNumber: trimmed, claimed: false };
    state.households.push(h);
    return delay(h);
  },
  claim: async (householdId: string, userId: string) => {
    const h = state.households.find((x) => x.id === householdId);
    if (h) {
      h.claimed = true;
      h.claimedByUserId = userId;
    }
    return delay(true);
  },
  bulkGenerate: async (societyId: string, blocks: string[], start: number, end: number, format: string) => {
    try {
      const res = await apiFetch<any[]>("/households/bulk", {
        method: "POST",
        body: JSON.stringify({
          societyId,
          blocks,
          startUnit: start,
          endUnit: end,
          formatPattern: format,
        }),
      });
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] bulkGenerate households fallback:", err);
    }
    const list: mock.Household[] = [];
    const blockList = blocks.length > 0 ? blocks : [""];
    blockList.forEach((b) => {
      for (let i = start; i <= end; i++) {
        let name = format.replace("{Block}", b).replace("{Unit}", String(i));
        list.push({ id: uid("h"), societyId, unitNumber: name, claimed: false });
      }
    });
    state.households.push(...list);
    return delay(list);
  },
  updateUnitNumber: async (id: string, unitNumber: string) => {
    try {
      const res = await apiFetch<any>(`/households/${id}?unit_number=${encodeURIComponent(unitNumber)}`, {
        method: "PUT",
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] updateUnitNumber fallback:", err);
    }
    const h = state.households.find((x) => x.id === id);
    if (h) h.unitNumber = unitNumber;
    return delay(h ?? null);
  },
  deleteHousehold: async (id: string) => {
    try {
      await apiFetch<any>(`/households/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[API Notice] deleteHousehold fallback:", err);
    }
    const idx = state.households.findIndex((x) => x.id === id);
    if (idx !== -1) state.households.splice(idx, 1);
    return delay(true);
  },
  deleteAll: async (societyId: string) => {
    try {
      await apiFetch<any>(`/households/society/${societyId}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[API Notice] deleteAll households fallback:", err);
    }
    state.households = state.households.filter((h) => h.societyId !== societyId);
    return delay(true);
  },
};

// ---------------- Join Requests ----------------
export const joinRequestService = {
  submit: async (req: any) => {
    try {
      const res = await apiFetch<any>("/societies/join-requests", {
        method: "POST",
        body: JSON.stringify({
          societyId: req.societyId,
          householdId: req.householdId,
          unitNumber: req.unitNumber,
          idProofUrl: req.idProofUrl || "mock://id-proof.pdf",
        }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const j: mock.JoinRequest = {
      ...req,
      id: uid("jr"),
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    state.joinRequests.push(j);
    return delay(j);
  },
  listBySociety: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/societies/${societyId}/join-requests`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listBySociety joinRequests fallback:", err);
    }
    return delay(state.joinRequests.filter((r) => r.societyId === societyId));
  },
  approve: async (id: string) => {
    try {
      await apiFetch<any>(`/societies/join-requests/${id}/approve`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const currentUser = getStoredUser();
    if (currentUser) {
      const isLeadOrAdmin = currentUser.isPrimaryResident || currentUser.isCoordinator || currentUser.role === "admin" || currentUser.role === "owner";
      if (!isLeadOrAdmin) {
        throw new Error("Access Denied: Only primary leads, coordinators, or admins can approve join requests.");
      }
    }
    const r = state.joinRequests.find((x) => x.id === id) as any;
    if (r) {
      r.status = "approved";
      let u = state.users.find((x) => x.id === r.userId || x.name === r.userName);
      const soc = state.societies.find((s) => s.id === r.societyId);
      const grantCredits = soc?.initialCredits ?? 10;
      if (u) {
        u.societyId = r.societyId;
        u.householdId = r.householdId;
        u.creditBalance = (u.creditBalance || 0) + grantCredits;
      } else {
        u = {
          id: r.userId || uid("u"),
          name: r.userName,
          email: r.userEmail || r.email || `${r.userName.toLowerCase().replace(/\s+/g, "")}@cen.app`,
          role: "resident",
          societyId: r.societyId,
          householdId: r.householdId,
          creditBalance: grantCredits,
          joinedDate: new Date().toISOString().slice(0, 10),
          idProofUploaded: true,
          isCoordinator: false,
          hasCompletedSurvey: true,
          isActive: true,
        };
        state.users.push(u);
      }
      const hh = state.households.find((h) => h.id === r.householdId);
      if (hh) {
        hh.occupantsCount = (hh.occupantsCount || 0) + 1;
        if (!hh.claimed) {
          hh.claimed = true;
          hh.claimedByUserId = u.id;
        }
      }
    }
    return delay(true);
  },
  reject: async (id: string) => {
    try {
      await apiFetch<any>(`/societies/join-requests/${id}/reject`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const currentUser = getStoredUser();
    if (currentUser) {
      const isLeadOrAdmin = currentUser.isPrimaryResident || currentUser.isCoordinator || currentUser.role === "admin" || currentUser.role === "owner";
      if (!isLeadOrAdmin) {
        throw new Error("Access Denied: Only primary leads, coordinators, or admins can reject join requests.");
      }
    }
    const r = state.joinRequests.find((x) => x.id === id);
    if (r) r.status = "rejected";
    return delay(true);
  },

  getByUserId: async (userId: string) => {
    try {
      const res = await apiFetch<any>("/societies/join-requests/me");
      if (res) return res;
    } catch (err: any) {
      if (err.message && !err.message.includes("404") && !err.message.includes("No active")) {
        console.warn("[API Notice] getByUserId joinRequest fallback:", err);
      }
    }
    return delay(state.joinRequests.find((r) => r.userId === userId && r.status === "pending") ?? null);
  },
  deleteRequest: async (id: string) => {
    try {
      await apiFetch<any>(`/societies/join-requests/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[API Notice] deleteRequest joinRequest fallback:", err);
    }
    state.joinRequests = state.joinRequests.filter((x) => x.id !== id);
    return delay(true);
  },
};

// ---------------- Users / Residents ----------------
export const userService = {
  listAll: async () => {
    try {
      const res = await apiFetch<any[]>("/users");
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listAll users fallback:", err);
    }
    return delay(state.users);
  },
  listBySociety: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/users?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listBySociety users fallback:", err);
    }
    return delay(state.users.filter((u) => u.societyId === societyId && u.role !== "admin"));
  },

  listCoordinators: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/users/coordinators?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listCoordinators fallback:", err);
    }
    return delay(state.users.filter((u) => u.societyId === societyId && u.isCoordinator));
  },
  promote: async (userId: string, canManageOnboarding: boolean = true, canDeactivateResidents: boolean = false) => {
    try {
      await apiFetch<any>(`/users/${userId}/promote`, {
        method: "POST",
        body: JSON.stringify({ canManageOnboarding, canDeactivateResidents }),
      });
      return true;
    } catch (err) {
      console.warn("[API Notice] promote user fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.isCoordinator = true;
      u.role = "coordinator";
      u.canManageOnboarding = canManageOnboarding;
      u.canDeactivateResidents = canDeactivateResidents;
    }
    return delay(true);
  },
  updateCoordinatorPermissions: async (userId: string, canManageOnboarding: boolean, canDeactivateResidents: boolean) => {
    try {
      await apiFetch<any>(`/users/${userId}/coordinator-permissions`, {
        method: "PATCH",
        body: JSON.stringify({ canManageOnboarding, canDeactivateResidents }),
      });
      return true;
    } catch (err) {
      console.warn("[API Notice] updateCoordinatorPermissions fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.canManageOnboarding = canManageOnboarding;
      u.canDeactivateResidents = canDeactivateResidents;
    }
    return delay(true);
  },
  demote: async (userId: string) => {
    try {
      await apiFetch<any>(`/users/${userId}/demote`, { method: "POST" });
      return true;
    } catch (err) {
      console.warn("[API Notice] demote user fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.isCoordinator = false;
      u.role = "resident";
      u.canManageOnboarding = true;
      u.canDeactivateResidents = false;
    }
    return delay(true);
  },
  leaveSociety: async () => {
    try {
      const res = await apiFetch<any>("/users/me/leave-society", { method: "POST" });
      if (res) {
        const storedUser = getStoredUser();
        if (storedUser) {
          setStoredAuth(getStoredToken() || "", {
            ...storedUser,
            societyId: null,
            householdId: null,
            isCoordinator: false,
            isPrimaryResident: false,
            role: storedUser.role === "owner" ? "owner" : "resident",
            idProofUploaded: false,
            idProofVerified: false,
            idProofUrl: null,
          });
        }
        return res;
      }
    } catch (err: any) {
      if (err.message) throw err;
    }
    const storedUser = getStoredUser();
    if (storedUser) {
      const u = state.users.find((x) => x.id === storedUser.id);
      if (u) {
        u.societyId = undefined;
        u.householdId = undefined;
        u.isCoordinator = false;
        u.isPrimaryResident = false;
        if (u.role !== "owner") u.role = "resident";
        u.idProofUploaded = false;
        u.idProofVerified = false;
        u.idProofUrl = undefined;
      }
      // Free claimed households
      const hh = state.households.find((h) => h.claimedByUserId === storedUser.id);
      if (hh) {
        hh.claimed = false;
        hh.claimedByUserId = undefined;
        hh.occupantsCount = Math.max(0, (hh.occupantsCount || 1) - 1);
      }
      state.joinRequests = state.joinRequests.filter((jr) => jr.userId !== storedUser.id);
      setStoredAuth(getStoredToken() || "mock-token-123", {
        ...storedUser,
        societyId: null,
        householdId: null,
        isCoordinator: false,
        isPrimaryResident: false,
        role: storedUser.role === "owner" ? "owner" : "resident",
        idProofUploaded: false,
        idProofVerified: false,
        idProofUrl: null,
      });
      return delay(u);
    }
    return delay(true);
  },

  disableHouseholdAccess: async (userId: string) => {
    try {
      await apiFetch<any>(`/users/${userId}/disable-household-access`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) u.isHouseholdEnabled = false;
    return delay(true);
  },
  enableHouseholdAccess: async (userId: string) => {
    try {
      await apiFetch<any>(`/users/${userId}/enable-household-access`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) u.isHouseholdEnabled = true;
    return delay(true);
  },
  deactivateUser: async (userId: string) => {
    try {
      await apiFetch<any>(`/users/${userId}/deactivate`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) u.isActive = false;
    return delay(true);
  },
  reactivateUser: async (userId: string) => {
    try {
      await apiFetch<any>(`/users/${userId}/reactivate`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) u.isActive = true;
    return delay(true);
  },
  updateProfile: async (userId: string, data: { name?: string; email?: string; societyName?: string }) => {
    try {
      const res = await apiFetch<any>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name: data.name }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] updateProfile fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId);
    if (u && data.name) u.name = data.name;
    return delay(u ?? null);
  },
  updateOnboardingSurvey: async (
    userId: string,
    survey: { interests: string[]; offeredSkillsText: string; volunteerInterest: string },
  ) => {
    try {
      const res = await apiFetch<any>("/users/me/survey", {
        method: "POST",
        body: JSON.stringify({
          interests: survey.interests,
          offeredSkillsText: survey.offeredSkillsText,
          volunteerInterest: survey.volunteerInterest,
        }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] updateOnboardingSurvey fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.interests = survey.interests;
      u.offeredSkillsText = survey.offeredSkillsText;
      u.volunteerInterest = survey.volunteerInterest;
      u.hasCompletedSurvey = true;
    }
    return delay(u ?? null);
  },
  uploadIdProof: async (userId: string, idProofUrl: string) => {
    try {
      const res = await apiFetch<any>("/users/me/id-proof", {
        method: "POST",
        body: JSON.stringify({ idProofUrl }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] uploadIdProof fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.idProofUrl = idProofUrl;
      u.idProofUploaded = true;
      u.idProofVerified = false;
      u.verificationStatus = "pending";
    }
    return delay(u ?? null);
  },
  verifyIdProof: async (userId: string, verified: boolean) => {
    try {
      const res = await apiFetch<any>(`/users/${userId}/verify-id-proof?verified=${verified}`, {
        method: "POST",
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] verifyIdProof fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.idProofVerified = verified;
      if (verified) {
        u.idProofUploaded = true;
        u.verificationStatus = "verified";
      } else {
        u.idProofUploaded = false;
        u.verificationStatus = "unverified";
      }
    }
    return delay(u ?? null);
  },
};


// ---------------- Skills ----------------
export const skillService = {
  list: async (societyId?: string) => {
    try {
      const res = await apiFetch<any[]>(`/marketplace/skills?society_id=${societyId || ""}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] list skills fallback:", err);
    }
    return delay(societyId ? state.skills.filter((s) => s.societyId === societyId) : state.skills);
  },
  listApproved: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/marketplace/skills?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listApproved skills fallback:", err);
    }
    return delay(state.skills.filter((s) => s.societyId === societyId && s.status === "approved"));
  },
  listPending: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/marketplace/skills/pending?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listPending skills fallback:", err);
    }
    return delay(state.skills.filter((s) => s.societyId === societyId && s.status === "pending"));
  },
  create: async (s: Omit<mock.Skill, "id" | "status">) => {
    try {
      const res = await apiFetch<any>("/marketplace/skills", {
        method: "POST",
        body: JSON.stringify({
          title: s.title,
          category: s.category,
          credits: s.credits,
          description: s.description,
          tags: s.tags,
        }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] create skill fallback:", err);
    }
    const newSkill: mock.Skill = { ...s, id: uid("sk"), status: "pending" };
    state.skills.push(newSkill);
    return delay(newSkill);
  },
  approve: async (id: string) => {
    try {
      await apiFetch<any>(`/marketplace/skills/${id}/approve`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const s = state.skills.find((x) => x.id === id);
    if (s) {
      s.status = "approved";
      s.rejectionReason = undefined;
    }
    return delay(true);
  },
  reject: async (id: string, rejectionReason: string) => {
    try {
      await apiFetch<any>(`/marketplace/skills/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
      });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const s = state.skills.find((x) => x.id === id);
    if (s) {
      s.status = "rejected";
      s.rejectionReason = rejectionReason;
    }
    return delay(true);
  },
  update: async (id: string, data: Partial<mock.Skill>) => {
    try {
      const res = await apiFetch<any>(`/marketplace/skills/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: data.title,
          category: data.category,
          credits: data.credits,
          description: data.description,
          tags: data.tags,
        }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const s = state.skills.find((x) => x.id === id);
    if (s) {
      if (data.title !== undefined) s.title = data.title;
      if (data.category !== undefined) s.category = data.category;
      if (data.credits !== undefined) s.credits = data.credits;
      if (data.description !== undefined) s.description = data.description;
      if (data.tags !== undefined) s.tags = data.tags;
      s.status = "pending";
      s.rejectionReason = undefined;
    }
    return delay(s);
  },
  book: async (skillId: string, requesterId: string) => {
    try {
      await apiFetch<any>(`/marketplace/skills/${skillId}/book`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    return delay(true);
  },
  delete: async (id: string) => {
    try {
      await apiFetch<any>(`/marketplace/skills/${id}`, { method: "DELETE" });
    } catch (err: any) {
      if (err.message) throw err;
    }
    const s = state.skills.find((x) => x.id === id);
    if (s) (s as any).status = "deleted";
    return delay(true);
  },
  relist: async (id: string) => {
    try {
      const res = await apiFetch<any>(`/marketplace/skills/${id}/relist`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const s = state.skills.find((x) => x.id === id);
    if (s) {
      s.status = "pending";
      s.rejectionReason = undefined;
    }
    return delay(s);
  },
};

// ---------------- Resources ----------------
export const resourceService = {
  list: async (societyId?: string) => {
    try {
      const res = await apiFetch<any[]>(`/marketplace/resources?society_id=${societyId || ""}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] list resources fallback:", err);
    }
    return delay(societyId ? state.resources.filter((r) => r.societyId === societyId) : state.resources);
  },
  listApproved: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/marketplace/resources?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listApproved resources fallback:", err);
    }
    return delay(state.resources.filter((r) => r.societyId === societyId && r.status === "approved"));
  },
  listPending: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/marketplace/resources/pending?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listPending resources fallback:", err);
    }
    return delay(state.resources.filter((r) => r.societyId === societyId && r.status === "pending"));
  },
  create: async (r: Omit<mock.Resource, "id" | "status">) => {
    try {
      const res = await apiFetch<any>("/marketplace/resources", {
        method: "POST",
        body: JSON.stringify({
          name: r.name,
          category: r.category,
          credits: r.credits,
          description: r.description,
          imageUrl: r.imageUrl,
        }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] create resource fallback:", err);
    }
    const newRes: mock.Resource = { ...r, id: uid("r"), status: "pending" };
    state.resources.push(newRes);
    return delay(newRes);
  },
  approve: async (id: string) => {
    try {
      await apiFetch<any>(`/marketplace/resources/${id}/approve`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) {
      r.status = "approved";
      r.rejectionReason = undefined;
    }
    return delay(true);
  },
  reject: async (id: string, rejectionReason: string) => {
    try {
      await apiFetch<any>(`/marketplace/resources/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
      });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) {
      r.status = "rejected";
      r.rejectionReason = rejectionReason;
    }
    return delay(true);
  },
  update: async (id: string, data: Partial<mock.Resource>) => {
    try {
      const res = await apiFetch<any>(`/marketplace/resources/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          credits: data.credits,
          description: data.description,
          imageUrl: data.imageUrl,
        }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) {
      if (data.name !== undefined) r.name = data.name;
      if (data.category !== undefined) r.category = data.category;
      if (data.credits !== undefined) r.credits = data.credits;
      if (data.description !== undefined) r.description = data.description;
      if (data.imageUrl !== undefined) r.imageUrl = data.imageUrl;
      r.status = "pending";
      r.available = true;
      r.rejectionReason = undefined;
    }
    return delay(r);
  },

  borrow: async (resourceId: string, requesterId: string) => {
    try {
      await apiFetch<any>(`/marketplace/resources/${resourceId}/book`, { method: "POST" });
      return true;
    } catch (err: any) {
      if (err.message) throw err;
    }
    return delay(true);
  },
  toggleAvailability: async (id: string, available: boolean) => {
    try {
      const res = await apiFetch<any>(`/marketplace/resources/${id}/availability?available=${available}`, { method: "PATCH" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) {
      r.available = available;
      if (available) r.status = "approved";
    }
    return delay(r);
  },
  relist: async (id: string) => {
    try {
      const res = await apiFetch<any>(`/marketplace/resources/${id}/relist`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) {
      r.status = "pending";
      r.available = true;
    }
    return delay(r);
  },
  markReturned: async (id: string) => {
    try {
      const res = await apiFetch<any>(`/marketplace/resources/${id}/return`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) {
      r.available = true;
      r.status = "returned";
    }
    return delay(r);
  },
  delete: async (id: string) => {
    try {
      await apiFetch<any>(`/marketplace/resources/${id}`, { method: "DELETE" });
    } catch (err: any) {
      if (err.message) throw err;
    }
    const r = state.resources.find((x) => x.id === id);
    if (r) {
      (r as any).status = "deleted";
      r.available = false;
    }
    return delay(true);
  },
};

// ---------------- Credits ----------------
export const creditService = {
  getBalance: async (userId: string) => {
    try {
      const res = await apiFetch<{ creditBalance: number }>("/wallet/balance");
      if (res && res.creditBalance !== undefined) return res.creditBalance;
    } catch (err) {
      console.warn("[API Notice] getBalance fallback:", err);
    }
    const u = state.users.find((x) => x.id === userId) || getStoredUser();
    return delay(u?.creditBalance ?? 0);
  },
  getTransactions: async (userId: string) => {
    try {
      const res = await apiFetch<any[]>("/wallet/transactions");
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] getTransactions fallback:", err);
    }
    return delay(state.transactions.filter((t) => t.userId === userId));
  },
};

// ---------------- Events ----------------
export const eventService = {
  list: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/events?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] list events fallback:", err);
    }
    return delay(state.events.filter((e) => e.societyId === societyId));
  },
  create: async (e: Omit<mock.EventItem, "id" | "volunteers" | "status">) => {
    try {
      const res = await apiFetch<any>("/events", {
        method: "POST",
        body: JSON.stringify({
          title: e.title,
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          time: e.time,
          location: e.location,
          description: e.description,
          volunteersNeeded: e.volunteersNeeded,
          color: e.color,
          textColor: e.textColor,
        }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const ne: mock.EventItem = { ...e, id: uid("ev"), volunteers: [], status: "upcoming" };
    state.events.push(ne);
    return delay(ne);
  },

  listVolunteerRequests: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/events/volunteers?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listVolunteerRequests fallback:", err);
    }
    const eventIds = state.events.filter((e) => e.societyId === societyId).map((e) => e.id);
    return delay(state.volunteerRequests.filter((v) => eventIds.includes(v.eventId)));
  },
  requestVolunteer: async (eventId: string, residentId: string, residentName: string, eventTitle: string) => {
    try {
      const res = await apiFetch<any>(`/events/${eventId}/volunteer`, { method: "POST" });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] requestVolunteer fallback:", err);
    }
    const existing = state.volunteerRequests.find((v) => v.eventId === eventId && v.residentId === residentId);
    if (existing) {
      existing.type = "self-requested";
      existing.status = "pending";
      existing.leaveReason = undefined;
      return delay(existing);
    }

    const v: mock.VolunteerRequest = {
      id: uid("vr"),
      eventId,
      eventTitle,
      residentId,
      residentName,
      type: "self-requested",
      status: "pending",
    };
    state.volunteerRequests.push(v);
    return delay(v);
  },
  inviteVolunteer: async (eventId: string, residentId: string, residentName: string, eventTitle: string) => {
    try {
      const res = await apiFetch<any>(`/events/${eventId}/invite`, {
        method: "POST",
        body: JSON.stringify({ resident_id: residentId }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] inviteVolunteer fallback:", err);
    }
    const existing = state.volunteerRequests.find((v) => v.eventId === eventId && v.residentId === residentId);
    if (existing) {
      existing.type = "coordinator-invited";
      existing.status = "pending";
      existing.leaveReason = undefined;
      return delay(existing);
    }

    const v: mock.VolunteerRequest = {
      id: uid("vr"),
      eventId,
      eventTitle,
      residentId,
      residentName,
      type: "coordinator-invited",
      status: "pending",
    };
    state.volunteerRequests.push(v);
    return delay(v);
  },
  approveVolunteer: async (id: string) => {
    try {
      await apiFetch<any>(`/events/volunteer-requests/${id}/approve`, { method: "POST" });
    } catch (err) {
      console.warn("[API Notice] approveVolunteer fallback:", err);
    }
    const v = state.volunteerRequests.find((x) => x.id === id);
    if (v) {
      v.status = "approved";
      const ev = state.events.find((e) => e.id === v.eventId);
      if (ev && !ev.volunteers.includes(v.residentId)) {
        ev.volunteers.push(v.residentId);
      }
    }
    return delay(true);
  },
  rejectVolunteer: async (id: string, reason?: string) => {
    try {
      await apiFetch<any>(`/events/volunteer-requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason: reason }),
      });
    } catch (err) {
      console.warn("[API Notice] rejectVolunteer fallback:", err);
    }
    const v = state.volunteerRequests.find((x) => x.id === id);
    if (v) {
      v.status = "rejected";
      v.rejectionReason = reason;
    }
    return delay(true);
  },

  cancelInvite: async (id: string) => {
    try {
      await apiFetch<any>(`/events/volunteer-requests/${id}/cancel`, { method: "POST" });
    } catch (err) {
      console.warn("[API Notice] cancelInvite fallback:", err);
    }
    state.volunteerRequests = state.volunteerRequests.filter((v) => v.id !== id);
    return delay(true);
  },
  leave: async (eventId: string, residentId: string, reason: string) => {
    try {
      await apiFetch<any>(`/events/${eventId}/leave`, {
        method: "POST",
        body: JSON.stringify({ leaveReason: reason }),
      });
    } catch (err) {
      console.warn("[API Notice] leave event API failed, attempting fallback:", err);
      const v = state.volunteerRequests.find((x) => x.eventId === eventId && x.residentId === residentId);
      if (v) {
        try {
          await apiFetch<any>(`/events/volunteer-requests/${v.id}/withdraw`, {
            method: "POST",
            body: JSON.stringify({ leaveReason: reason }),
          });
        } catch (e2) {
          console.warn("[API Notice] leave event fallback failed:", e2);
        }
      }
    }

    const vMock = state.volunteerRequests.find((x) => x.eventId === eventId && x.residentId === residentId);
    if (vMock) {
      vMock.status = "left";
      vMock.leaveReason = reason;
    }
    const ev = state.events.find((e) => e.id === eventId);
    if (ev) ev.volunteers = ev.volunteers.filter((uid) => uid !== residentId);
    return delay(true);
  },
  update: async (id: string, data: Partial<mock.EventItem>) => {
    try {
      const res = await apiFetch<any>(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          volunteersNeeded: data.volunteersNeeded,
          color: data.color,
          textColor: data.textColor,
          status: data.status,
        }),
      });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const ev = state.events.find((e) => e.id === id);
    if (ev) {
      Object.assign(ev, data);
    }
    return delay(ev);
  },
  complete: async (id: string) => {
    try {
      const res = await apiFetch<any>(`/events/${id}/complete`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const ev = state.events.find((e) => e.id === id);
    if (ev) ev.status = "completed";
    return delay(ev);
  },
  delete: async (id: string) => {
    try {
      await apiFetch<any>(`/events/${id}`, { method: "DELETE" });
    } catch (err: any) {
      if (err.message) throw err;
    }
    state.events = state.events.filter((e) => e.id !== id);
    state.volunteerRequests = state.volunteerRequests.filter((v) => v.eventId !== id);
    return delay(true);
  },
};


// ---------------- Exchange Bookings ----------------
export interface ExchangeBooking {
  id: string;
  itemType: "skill" | "resource";
  itemId: string;
  itemTitle: string;
  ownerId: string;
  ownerName: string;
  buyerId: string;
  buyerName: string;
  credits: number;
  status: "pending_owner_approval" | "approved" | "declined";
  createdAt: string;
  societyId: string;
}

export const bookingService = {
  listForUser: async () => {
    try {
      const res = await apiFetch<ExchangeBooking[]>("/marketplace/bookings");
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listForUser bookings fallback:", err);
    }
    return delay(state.exchangeBookings);
  },
  requestSkill: async (skillId: string, buyerId: string) => {
    try {
      const res = await apiFetch<ExchangeBooking>(`/marketplace/skills/${skillId}/book`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const skill = state.skills.find((s) => s.id === skillId);
    const buyer = state.users.find((u) => u.id === buyerId);
    if (!skill || !buyer) throw new Error("Skill or buyer not found.");
    if (buyer.creditBalance < skill.credits) throw new Error(`Insufficient credits. You need at least ${skill.credits} credits.`);
    
    const newBooking: ExchangeBooking = {
      id: uid("eb"),
      itemType: "skill",
      itemId: skill.id,
      itemTitle: skill.title,
      ownerId: skill.providerId,
      ownerName: skill.providerName,
      buyerId: buyer.id,
      buyerName: buyer.name,
      credits: skill.credits,
      status: "pending_owner_approval",
      createdAt: new Date().toISOString().split("T")[0],
      societyId: buyer.societyId || skill.societyId,
    };
    state.exchangeBookings.push(newBooking);
    return delay(newBooking);
  },
  requestResource: async (resourceId: string, buyerId: string) => {
    try {
      const res = await apiFetch<ExchangeBooking>(`/marketplace/resources/${resourceId}/book`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const resItem = state.resources.find((r) => r.id === resourceId);
    const buyer = state.users.find((u) => u.id === buyerId);
    if (!resItem || !buyer) throw new Error("Resource or buyer not found.");
    if (buyer.creditBalance < resItem.credits) throw new Error(`Insufficient credits. You need at least ${resItem.credits} credits.`);
    
    const newBooking: ExchangeBooking = {
      id: uid("eb"),
      itemType: "resource",
      itemId: resItem.id,
      itemTitle: resItem.name,
      ownerId: resItem.ownerId,
      ownerName: resItem.ownerName,
      buyerId: buyer.id,
      buyerName: buyer.name,
      credits: resItem.credits,
      status: "pending_owner_approval",
      createdAt: new Date().toISOString().split("T")[0],
      societyId: buyer.societyId || resItem.societyId,
    };
    state.exchangeBookings.push(newBooking);
    return delay(newBooking);
  },
  approveBooking: async (bookingId: string) => {
    try {
      const res = await apiFetch<ExchangeBooking>(`/marketplace/bookings/${bookingId}/approve`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const b = state.exchangeBookings.find((x) => x.id === bookingId);
    if (b) {
      const buyer = state.users.find((u) => u.id === b.buyerId);
      const owner = state.users.find((u) => u.id === b.ownerId);
      if (buyer && owner && buyer.creditBalance >= b.credits) {
        buyer.creditBalance -= b.credits;
        owner.creditBalance += b.credits;
      }
      b.status = "approved";
      if (b.itemType === "resource") {
        const r = state.resources.find((item) => item.id === b.itemId);
        if (r) r.available = false;
      }
      // Auto-decline / remove all other pending requests for this exact same item
      state.exchangeBookings.forEach((other) => {
        if (other.itemId === b.itemId && other.id !== b.id && other.status === "pending_owner_approval") {
          other.status = "declined";
        }
      });
    }
    return delay(b);
  },
  declineBooking: async (bookingId: string) => {
    try {
      const res = await apiFetch<ExchangeBooking>(`/marketplace/bookings/${bookingId}/decline`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const b = state.exchangeBookings.find((x) => x.id === bookingId);
    if (b) b.status = "declined";
    return delay(b);
  },
  cancelBooking: async (bookingId: string) => {
    try {
      const res = await apiFetch<ExchangeBooking>(`/marketplace/bookings/${bookingId}/cancel`, { method: "POST" });
      if (res) return res;
    } catch (err: any) {
      if (err.message) throw err;
    }
    const b = state.exchangeBookings.find((x) => x.id === bookingId);
    if (b) b.status = "cancelled";
    return delay(b);
  },
};

// ---------------- Complaints ----------------
export const complaintService = {
  list: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/complaints?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] list complaints fallback:", err);
    }
    return delay(state.complaints.filter((c) => c.societyId === societyId && !c.isAgainstCoordinator));
  },
  listSociety: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/complaints?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listSociety complaints fallback:", err);
    }
    return delay(state.complaints.filter((c) => c.societyId === societyId && !c.isAgainstCoordinator));
  },
  listPrivateAgainstCoordinators: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/complaints/private-coordinators?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listPrivateAgainstCoordinators complaints fallback:", err);
    }
    return delay(state.complaints.filter((c) => c.societyId === societyId && c.isAgainstCoordinator));
  },
  listForUser: async (societyId: string, userId?: string) => {
    try {
      const res = await apiFetch<any[]>(`/complaints?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] listForUser complaints fallback:", err);
    }
    return delay(
      state.complaints.filter(
        (c) => !c.isAgainstCoordinator && (!userId || c.filedById === userId || c.involvedUserIds?.includes(userId)),
      ),
    );
  },
  file: async (c: any) => {
    try {
      const isAnon = c.isAnonymous || c.filedByName === "Anonymous";
      const res = await apiFetch<any>("/complaints", {
        method: "POST",
        body: JSON.stringify({
          title: c.subject || c.title || "Complaint",
          category: c.category || "General",
          description: c.description,
          priority: c.priority,
          targetCoordinatorId: c.targetCoordinatorId,
          isPrivate: false,
          isAnonymous: isAnon,
          filedByName: isAnon ? "Anonymous" : c.filedByName,
        }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] file complaint fallback:", err);
    }
    const nc: mock.Complaint = {
      ...c,
      id: uid("c"),
      status: "open",
      createdAt: new Date().toISOString().slice(0, 10),
      isAgainstCoordinator: false,
      filedByName: c.isAnonymous ? "Anonymous" : c.filedByName,
    };
    state.complaints.push(nc);
    return delay(nc);
  },
  fileAgainstCoordinator: async (c: any) => {
    try {
      const isAnon = c.isAnonymous || c.filedByName === "Anonymous";
      const res = await apiFetch<any>("/complaints", {
        method: "POST",
        body: JSON.stringify({
          title: c.subject || c.title || "Coordinator Conduct Complaint",
          category: c.category || "Coordinator Conduct",
          description: c.description,
          priority: c.priority,
          targetCoordinatorId: c.targetCoordinatorId,
          isPrivate: true,
          isAnonymous: isAnon,
          filedByName: isAnon ? "Anonymous" : c.filedByName,
        }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] fileAgainstCoordinator fallback:", err);
    }
    const nc: mock.Complaint = {
      ...c,
      id: uid("c"),
      status: "open",
      createdAt: new Date().toISOString().slice(0, 10),
      isAgainstCoordinator: true,
      filedByName: c.isAnonymous ? "Anonymous" : c.filedByName,
      involvedUserIds: [],
    };
    state.complaints.push(nc);
    return delay(nc);
  },
  takeAction: async (id: string, action: "in-review" | "resolved" | "dismissed", notes?: string) => {
    try {
      const res = await apiFetch<any>(`/complaints/${id}/action`, {
        method: "POST",
        body: JSON.stringify({
          status: action === "in-review" ? "under_review" : action,
          notes: notes,
          resolutionNotes: notes,
        }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] takeAction complaint fallback:", err);
    }
    const c = state.complaints.find((x) => x.id === id);
    if (c) {
      c.status = action;
      if (notes) (c as any).resolutionNotes = notes;
    }
    return delay(true);
  },
  delete: async (id: string) => {
    try {
      await apiFetch<any>(`/complaints/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[API Notice] delete complaint fallback:", err);
    }
    state.complaints = state.complaints.filter((x) => x.id !== id);
    return delay(true);
  },
};

// ---------------- Disputes ----------------
export const disputeService = {
  list: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/disputes?society_id=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] list disputes fallback:", err);
    }
    return delay([]);
  },
  file: async (d: {
    bookingId: string;
    itemTitle: string;
    itemType: string;
    buyerId: string;
    buyerName: string;
    ownerId: string;
    ownerName: string;
    reason: string;
  }) => {
    try {
      const res = await apiFetch<any>("/disputes", {
        method: "POST",
        body: JSON.stringify(d),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] file dispute fallback:", err);
      throw err;
    }
  },
  updateNote: async (disputeId: string, note: string) => {
    try {
      const res = await apiFetch<any>(`/disputes/${disputeId}/note`, {
        method: "PUT",
        body: JSON.stringify({ note }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] updateNote dispute fallback:", err);
      throw err;
    }
  },
  updateStatus: async (disputeId: string, status: string, resolutionNotes?: string) => {
    try {
      const res = await apiFetch<any>(`/disputes/${disputeId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, resolutionNotes }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] updateStatus dispute fallback:", err);
      throw err;
    }
  },
  delete: async (disputeId: string) => {
    try {
      await apiFetch<any>(`/disputes/${disputeId}`, {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      console.warn("[API Notice] delete dispute fallback:", err);
      throw err;
    }
  },
};

// ---------------- Notices ----------------
export const noticeService = {
  list: async (societyId: string) => {
    try {
      const res = await apiFetch<any[]>(`/notices?societyId=${societyId}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] list notices fallback:", err);
    }
    return delay(state.notices.filter((n) => n.societyId === societyId));
  },
  post: async (n: Omit<mock.Notice, "id" | "date">) => {
    try {
      const res = await apiFetch<any>("/notices", {
        method: "POST",
        body: JSON.stringify({
          societyId: n.societyId,
          title: n.title,
          content: n.content,
          category: n.category,
        }),
      });
      if (res) return res;
    } catch (err: any) {
      console.warn("[API Notice] post notice error:", err);
      if (err.message) throw err;
    }
    const nn: mock.Notice = { ...n, id: uid("n"), date: new Date().toISOString().slice(0, 10) };
    state.notices.unshift(nn);
    return delay(nn);
  },
  delete: async (id: string) => {
    try {
      await apiFetch<any>(`/notices/${id}`, { method: "DELETE" });
      return true;
    } catch (err) {
      console.warn("[API Notice] delete notice fallback:", err);
    }
    const i = state.notices.findIndex((x) => x.id === id);
    if (i >= 0) state.notices.splice(i, 1);
    return delay(true);
  },
  hasPostedToday: async (userId: string) => {
    try {
      const res = await apiFetch<any>("/notices/posted-today");
      if (res && typeof res.hasPostedToday === "boolean") {
        return res.hasPostedToday;
      }
    } catch (err) {
      console.warn("[API Notice] hasPostedToday fallback:", err);
    }
    const today = new Date().toISOString().slice(0, 10);
    return delay(state.notices.some((n) => (n.postedById === userId || (n as any).postedByUserId === userId) && n.date === today));
  },
};

// ---------------- Chat ----------------
export const chatService = {
  getMessages: async (userA: string, userB: string) => {
    try {
      const res = await apiFetch<any[]>(`/chat/messages?otherUserId=${userB}`);
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] getMessages chat fallback:", err);
    }
    return delay(
      state.chat.filter(
        (m) =>
          (m.senderId === userA && m.receiverId === userB) ||
          (m.senderId === userB && m.receiverId === userA),
      ),
    );
  },
  sendMessage: async (senderId: string, senderName: string, receiverId: string, content: string) => {
    try {
      const res = await apiFetch<any>("/chat/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId, content }),
      });
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] sendMessage chat fallback:", err);
    }
    const m: mock.ChatMessage = {
      id: uid("m"),
      senderId,
      senderName,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
    };
    state.chat.push(m);
    return delay(m);
  },
};

// ---------------- Analytics ----------------
export const analyticsService = {
  getSocietyPerformance: async (societyId: string = "soc-demo") => {
    try {
      const res = await apiFetch<any>(`/analytics/society/${societyId}`);
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] getSocietyPerformance fallback:", err);
    }
    return delay({
      societyId,
      societyName: "Green Oasis Society",
      performanceScore: 98,
      coordinatorCount: 2,
      totalResidents: 15,
      activeSkills: 8,
      activeResources: 6,
      totalEvents: 4,
      resolvedComplaintsPct: 92.5,
    });
  },
  getOwnerAnalytics: async () => {
    try {
      const res = await apiFetch<any>("/analytics/owner");
      if (res) return res;
    } catch (err) {
      console.warn("[API Notice] getOwnerAnalytics fallback:", err);
    }
    return delay({
      totalSocieties: 6,
      activeSocieties: 6,
      pendingApplications: 2,
      totalResidents: 5,
      totalTransactions: 4,
      totalCreditsCirculating: 205,
      totalSkills: 6,
      totalResources: 6,
      totalEvents: 3,
      totalComplaints: 3,
      users: state.users.map((u) => {
        const soc = state.societies.find((s) => s.id === u.societyId);
        const hh = state.households.find((h) => h.id === u.householdId);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          societyId: u.societyId,
          societyName: soc ? soc.name : "Unassigned",
          householdId: u.householdId,
          householdUnit: hh ? hh.unitNumber : "Unassigned",
          creditBalance: u.creditBalance,
          joinedDate: u.joinedDate,
          isActive: u.isActive !== false,
          isCoordinator: !!u.isCoordinator,
          idProofUploaded: !!u.idProofUploaded,
          idProofVerified: !!u.idProofVerified,
        };
      }),
    });
  },
  getOwnerUserDirectory: async () => {
    try {
      const res = await apiFetch<any[]>("/analytics/owner/users");
      if (Array.isArray(res)) return res;
    } catch (err) {
      console.warn("[API Notice] getOwnerUserDirectory fallback:", err);
    }
    return delay(
      state.users.map((u) => {
        const soc = state.societies.find((s) => s.id === u.societyId);
        const hh = state.households.find((h) => h.id === u.householdId);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          societyId: u.societyId,
          societyName: soc ? soc.name : "Unassigned",
          householdId: u.householdId,
          householdUnit: hh ? hh.unitNumber : "Unassigned",
          creditBalance: u.creditBalance,
          joinedDate: u.joinedDate,
          isActive: u.isActive !== false,
          isCoordinator: !!u.isCoordinator,
          idProofUploaded: !!u.idProofUploaded,
          idProofVerified: !!u.idProofVerified,
        };
      })
    );
  },
};


export { state as __mockState };
