// ============================================================================
// SERVICE LAYER — All data reads/writes go through here.
// Every function currently returns mock data.
// TODO: replace each mock with real backend endpoint when API is ready.
// ============================================================================

import * as mock from "@/mocks/data";

// Simulate network delay so UI states feel real
const delay = <T>(v: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(v), ms));

// In-memory mutable copies so mock mutations persist during the session
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
};

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------- Auth ----------------
// TODO: replace mock with real backend endpoint
export const authService = {
  login: async (email: string, _password: string) => {
    const user = state.users.find((u) => u.email === email);
    return delay(user ?? null);
  },
  signup: async (name: string, email: string) => {
    const u: mock.User = {
      id: uid("u"),
      name,
      email,
      role: "resident",
      creditBalance: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
      idProofUploaded: false,
      isCoordinator: false,
    };
    state.users.push(u);
    return delay(u);
  },
  logout: async () => delay(true),
  getUserById: async (id: string) => delay(state.users.find((u) => u.id === id) ?? null),
};

// ---------------- Societies ----------------
// TODO: replace mock with real backend endpoint
export const societyService = {
  list: async () => delay(state.societies),
  getById: async (id: string) => delay(state.societies.find((s) => s.id === id) ?? null),
  submitApplication: async (a: Omit<mock.SocietyApplication, "id" | "status" | "submittedAt">) => {
    const app: mock.SocietyApplication = {
      ...a,
      id: uid("app"),
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    state.applications.push(app);
    return delay(app);
  },
  listApplications: async () => delay(state.applications),
  approveApplication: async (id: string, capacity: number, hhStart: number, hhEnd: number) => {
    const a = state.applications.find((x) => x.id === id);
    if (a) {
      a.status = "approved";
      const newSoc: mock.Society = {
        id: uid("soc"),
        name: a.societyName,
        type: a.type,
        address: a.address,
        latitude: 12.97,
        longitude: 77.59,
        adminId: uid("u"),
        capacity,
        householdRangeStart: hhStart,
        householdRangeEnd: hhEnd,
        coordinatorCount: 0,
        status: "active",
        performanceScore: 50,
        key: `${a.societyName.slice(0, 4).toUpperCase()}-${Math.floor(Math.random() * 99)}`,
      };
      state.societies.push(newSoc);
    }
    return delay(true);
  },
  rejectApplication: async (id: string) => {
    const a = state.applications.find((x) => x.id === id);
    if (a) a.status = "rejected";
    return delay(true);
  },
  suspend: async (id: string) => {
    const s = state.societies.find((x) => x.id === id);
    if (s) s.status = "suspended";
    return delay(true);
  },
};

// ---------------- Households ----------------
// TODO: replace mock with real backend endpoint
export const householdService = {
  listBySociety: async (societyId: string) =>
    delay(state.households.filter((h) => h.societyId === societyId)),
  register: async (societyId: string, unitNumber: string) => {
    const h: mock.Household = {
      id: uid("h"),
      societyId,
      unitNumber,
      claimed: false,
    };
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
};

// ---------------- Join Requests ----------------
// TODO: replace mock with real backend endpoint
export const joinRequestService = {
  submit: async (req: Omit<mock.JoinRequest, "id" | "status" | "submittedAt">) => {
    const j: mock.JoinRequest = {
      ...req,
      id: uid("jr"),
      status: "pending",
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    state.joinRequests.push(j);
    return delay(j);
  },
  listBySociety: async (societyId: string) =>
    delay(state.joinRequests.filter((r) => r.societyId === societyId)),
  approve: async (id: string) => {
    const r = state.joinRequests.find((x) => x.id === id);
    if (r) r.status = "approved";
    return delay(true);
  },
  reject: async (id: string) => {
    const r = state.joinRequests.find((x) => x.id === id);
    if (r) r.status = "rejected";
    return delay(true);
  },
};

// ---------------- Users / Residents ----------------
// TODO: replace mock with real backend endpoint
export const userService = {
  listBySociety: async (societyId: string) =>
    delay(state.users.filter((u) => u.societyId === societyId && u.role !== "admin")),
  listCoordinators: async (societyId: string) =>
    delay(state.users.filter((u) => u.societyId === societyId && u.isCoordinator)),
  promote: async (userId: string) => {
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.isCoordinator = true;
      u.role = "coordinator";
    }
    return delay(true);
  },
  demote: async (userId: string) => {
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      u.isCoordinator = false;
      u.role = "resident";
    }
    return delay(true);
  },
  updateProfile: async (userId: string, data: { name?: string; email?: string; societyName?: string }) => {
    const u = state.users.find((x) => x.id === userId);
    if (u) {
      if (data.name !== undefined) u.name = data.name;
      if (data.email !== undefined) u.email = data.email;
      if (data.societyName !== undefined && u.societyId) {
        const s = state.societies.find((x) => x.id === u.societyId);
        if (s) s.name = data.societyName;
      }
    }
    return delay(u ?? null);
  },
};

// ---------------- Skills ----------------
// TODO: replace mock with real backend endpoint
export const skillService = {
  list: async (societyId?: string) =>
    delay(societyId ? state.skills.filter((s) => s.societyId === societyId) : state.skills),
  listApproved: async (societyId: string) =>
    delay(state.skills.filter((s) => s.societyId === societyId && s.status === "approved")),
  listPending: async (societyId: string) =>
    delay(state.skills.filter((s) => s.societyId === societyId && s.status === "pending")),
  create: async (s: Omit<mock.Skill, "id" | "status">) => {
    const newSkill: mock.Skill = { ...s, id: uid("sk"), status: "pending" };
    state.skills.push(newSkill);
    return delay(newSkill);
  },
  approve: async (id: string) => {
    const s = state.skills.find((x) => x.id === id);
    if (s) s.status = "approved";
    return delay(true);
  },
  reject: async (id: string) => {
    const s = state.skills.find((x) => x.id === id);
    if (s) s.status = "rejected";
    return delay(true);
  },
  book: async (skillId: string, requesterId: string) => {
    const s = state.skills.find((x) => x.id === skillId);
    if (s) {
      const req = state.users.find((u) => u.id === requesterId);
      const prov = state.users.find((u) => u.id === s.providerId);
      if (req && prov && req.creditBalance >= s.credits) {
        req.creditBalance -= s.credits;
        prov.creditBalance += s.credits;
        state.transactions.push({
          id: uid("t"),
          userId: requesterId,
          type: "spent",
          amount: s.credits,
          description: `Booked skill: ${s.title}`,
          date: new Date().toISOString().slice(0, 10),
        });
        state.transactions.push({
          id: uid("t"),
          userId: s.providerId,
          type: "earned",
          amount: s.credits,
          description: `Provided skill: ${s.title} to ${req.name}`,
          date: new Date().toISOString().slice(0, 10),
        });
      }
    }
    return delay(true);
  },
};

// ---------------- Resources ----------------
// TODO: replace mock with real backend endpoint
export const resourceService = {
  list: async (societyId?: string) =>
    delay(societyId ? state.resources.filter((r) => r.societyId === societyId) : state.resources),
  listApproved: async (societyId: string) =>
    delay(state.resources.filter((r) => r.societyId === societyId && r.status === "approved")),
  listPending: async (societyId: string) =>
    delay(state.resources.filter((r) => r.societyId === societyId && r.status === "pending")),
  create: async (r: Omit<mock.Resource, "id" | "status">) => {
    const newRes: mock.Resource = { ...r, id: uid("r"), status: "pending" };
    state.resources.push(newRes);
    return delay(newRes);
  },
  approve: async (id: string) => {
    const r = state.resources.find((x) => x.id === id);
    if (r) r.status = "approved";
    return delay(true);
  },
  reject: async (id: string) => {
    const r = state.resources.find((x) => x.id === id);
    if (r) r.status = "rejected";
    return delay(true);
  },
  borrow: async (resourceId: string, requesterId: string) => {
    const r = state.resources.find((x) => x.id === resourceId);
    if (r && r.available) {
      r.available = false;
      const req = state.users.find((u) => u.id === requesterId);
      const own = state.users.find((u) => u.id === r.ownerId);
      if (req && own && req.creditBalance >= r.credits) {
        req.creditBalance -= r.credits;
        own.creditBalance += r.credits;
        state.transactions.push({
          id: uid("t"),
          userId: requesterId,
          type: "spent",
          amount: r.credits,
          description: `Borrowed resource: ${r.name}`,
          date: new Date().toISOString().slice(0, 10),
        });
        state.transactions.push({
          id: uid("t"),
          userId: r.ownerId,
          type: "earned",
          amount: r.credits,
          description: `Lent resource: ${r.name} to ${req.name}`,
          date: new Date().toISOString().slice(0, 10),
        });
      }
    }
    return delay(true);
  },
};

// ---------------- Credits ----------------
// TODO: replace mock with real backend endpoint
export const creditService = {
  getBalance: async (userId: string) => {
    const u = state.users.find((x) => x.id === userId);
    return delay(u?.creditBalance ?? 0);
  },
  getTransactions: async (userId: string) =>
    delay(state.transactions.filter((t) => t.userId === userId)),
};

// ---------------- Events ----------------
// TODO: replace mock with real backend endpoint
export const eventService = {
  list: async (societyId: string) =>
    delay(state.events.filter((e) => e.societyId === societyId)),
  create: async (e: Omit<mock.EventItem, "id" | "volunteers" | "status">) => {
    const ne: mock.EventItem = { ...e, id: uid("ev"), volunteers: [], status: "upcoming" };
    state.events.push(ne);
    return delay(ne);
  },
  listVolunteerRequests: async (societyId: string) => {
    const eventIds = state.events.filter((e) => e.societyId === societyId).map((e) => e.id);
    return delay(state.volunteerRequests.filter((v) => eventIds.includes(v.eventId)));
  },
  requestVolunteer: async (eventId: string, residentId: string, residentName: string, eventTitle: string) => {
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
    const v = state.volunteerRequests.find((x) => x.id === id);
    if (v) {
      v.status = "approved";
      const ev = state.events.find((e) => e.id === v.eventId);
      if (ev && !ev.volunteers.includes(v.residentId)) ev.volunteers.push(v.residentId);
    }
    return delay(true);
  },
  rejectVolunteer: async (id: string) => {
    const v = state.volunteerRequests.find((x) => x.id === id);
    if (v) v.status = "rejected";
    return delay(true);
  },
};

// ---------------- Complaints ----------------
// TODO: replace mock with real backend endpoint
export const complaintService = {
  listSociety: async (societyId: string) =>
    delay(state.complaints.filter((c) => c.societyId === societyId && !c.isAgainstCoordinator)),
  listPrivateAgainstCoordinators: async (societyId: string) =>
    delay(state.complaints.filter((c) => c.societyId === societyId && c.isAgainstCoordinator)),
  listForUser: async (userId: string) =>
    delay(
      state.complaints.filter(
        (c) => !c.isAgainstCoordinator && (c.filedById === userId || c.involvedUserIds.includes(userId)),
      ),
    ),
  file: async (c: Omit<mock.Complaint, "id" | "status" | "createdAt" | "isAgainstCoordinator">) => {
    const nc: mock.Complaint = {
      ...c,
      id: uid("c"),
      status: "open",
      createdAt: new Date().toISOString().slice(0, 10),
      isAgainstCoordinator: false,
    };
    state.complaints.push(nc);
    return delay(nc);
  },
  fileAgainstCoordinator: async (
    c: Omit<mock.Complaint, "id" | "status" | "createdAt" | "isAgainstCoordinator" | "involvedUserIds">,
  ) => {
    const nc: mock.Complaint = {
      ...c,
      id: uid("c"),
      status: "open",
      createdAt: new Date().toISOString().slice(0, 10),
      isAgainstCoordinator: true,
      involvedUserIds: [],
    };
    state.complaints.push(nc);
    return delay(nc);
  },
  takeAction: async (id: string, action: "in-review" | "resolved" | "dismissed") => {
    const c = state.complaints.find((x) => x.id === id);
    if (c) c.status = action;
    return delay(true);
  },
};

// ---------------- Notices ----------------
// TODO: replace mock with real backend endpoint
export const noticeService = {
  list: async (societyId: string) =>
    delay(state.notices.filter((n) => n.societyId === societyId)),
  post: async (n: Omit<mock.Notice, "id" | "date">) => {
    const nn: mock.Notice = { ...n, id: uid("n"), date: new Date().toISOString().slice(0, 10) };
    state.notices.unshift(nn);
    return delay(nn);
  },
  delete: async (id: string) => {
    const i = state.notices.findIndex((x) => x.id === id);
    if (i >= 0) state.notices.splice(i, 1);
    return delay(true);
  },
  hasPostedToday: async (userId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return delay(state.notices.some((n) => n.postedById === userId && n.date === today));
  },
};

// ---------------- Chat ----------------
// TODO: replace mock with real backend endpoint
export const chatService = {
  getMessages: async (userA: string, userB: string) =>
    delay(
      state.chat.filter(
        (m) =>
          (m.senderId === userA && m.receiverId === userB) ||
          (m.senderId === userB && m.receiverId === userA),
      ),
    ),
  sendMessage: async (senderId: string, senderName: string, receiverId: string, content: string) => {
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

export { state as __mockState };
