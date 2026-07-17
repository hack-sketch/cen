// ============================================================================
// AI SERVICE LAYER — All AI features are frontend UI only with mock responses.
// TODO: replace each mock with real AI backend endpoint when ready.
// ============================================================================

import * as mock from "@/mocks/data";
import { __mockState } from "./index";

const delay = <T>(v: T, ms = 400): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

// AI 1 — Find nearby societies (public join flow)
// TODO: connect to real AI backend endpoint (geocoding + proximity + ranking)
export async function findNearbySocieties(address: string) {
  const list = __mockState.societies
    .filter((s) => s.status === "active")
    .map((s, i) => ({
      society: s,
      distanceKm: +(0.4 + i * 1.3 + Math.random() * 0.8).toFixed(1),
      matchReason:
        address && address.toLowerCase().includes("mg")
          ? "Close to your listed address (MG Road area)"
          : `Nearest active ${s.type.toLowerCase()} in your region`,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return delay(list);
}

// AI 2 — Chatbot (RAG-style, grounded in mock data)
// TODO: connect to real AI backend endpoint (RAG over society data)
export async function chatbotQuery(message: string, userId: string): Promise<string> {
  const user = __mockState.users.find((u) => u.id === userId);
  const q = message.toLowerCase();

  if (q.includes("balance") || q.includes("credit")) {
    return delay(`You currently have ${user?.creditBalance ?? 0} credits.`);
  }
  if (q.includes("event") || q.includes("next")) {
    const ev = __mockState.events
      .filter((e) => e.societyId === user?.societyId && e.status === "upcoming")
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return delay(ev ? `Next event: "${ev.title}" on ${ev.date}. ${ev.description}` : "No upcoming events.");
  }
  if (q.includes("resource") || q.includes("borrow") || q.includes("free this week")) {
    const list = __mockState.resources.filter(
      (r) => r.societyId === user?.societyId && r.status === "approved" && r.available,
    );
    return delay(`Available resources right now: ${list.map((r) => r.name).join(", ") || "none"}.`);
  }
  if (q.includes("skill") && (q.includes("under") || q.includes("cheap"))) {
    const list = __mockState.skills.filter(
      (s) => s.societyId === user?.societyId && s.status === "approved" && s.credits <= 3,
    );
    return delay(`Skills available for ≤ 3 credits: ${list.map((s) => s.title).join(", ") || "none"}.`);
  }
  if (q.includes("notice")) {
    const n = __mockState.notices.filter((n) => n.societyId === user?.societyId).slice(0, 3);
    return delay(`Recent notices:\n- ${n.map((x) => x.title).join("\n- ")}`);
  }
  if (q.includes("how do i") || q.includes("help")) {
    return delay(
      "You can post a skill from the Skills tab, borrow a resource from Resources, and view your credits in the Wallet. Ask me anything about your society!",
    );
  }
  return delay(
    `I understand your question about "${message}". In the full version I'll fetch real answers from your society's data. (Mock response.)`,
  );
}

// AI 3 — Natural language skill/resource matching
// TODO: connect to real AI backend semantic-search endpoint
export async function matchSkillResource(query: string, societyId: string) {
  const q = query.toLowerCase();
  const skillHits = __mockState.skills
    .filter((s) => s.societyId === societyId && s.status === "approved")
    .map((s) => ({
      item: s,
      kind: "skill" as const,
      score:
        (s.title.toLowerCase().includes(q) ? 3 : 0) +
        (s.description.toLowerCase().includes(q) ? 2 : 0) +
        s.tags.filter((t) => q.includes(t)).length,
      reason: `Matches keywords in ${s.tags.join(", ")}`,
    }));
  const resHits = __mockState.resources
    .filter((r) => r.societyId === societyId && r.status === "approved")
    .map((r) => ({
      item: r,
      kind: "resource" as const,
      score:
        (r.name.toLowerCase().includes(q) ? 3 : 0) +
        (r.description.toLowerCase().includes(q) ? 2 : 0) +
        (q.includes(r.category.toLowerCase()) ? 1 : 0),
      reason: `Resource in "${r.category}" that seems relevant`,
    }));
  const all = [...skillHits, ...resHits]
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  return delay(all);
}

// AI 4 — Auto-tag & categorize new skill/resource
// TODO: connect to real AI backend classification endpoint
export async function autoTag(text: string): Promise<{ category: string; tags: string[] }> {
  const t = text.toLowerCase();
  let category = "General";
  const tags: string[] = [];
  if (/(bike|cycle|repair|fix|plumb|electric)/.test(t)) {
    category = "Repair";
    tags.push("repair", "diy");
  } else if (/(teach|tutor|class|math|science)/.test(t)) {
    category = "Tutoring";
    tags.push("education", "tutoring");
  } else if (/(yoga|fitness|wellness|meditat)/.test(t)) {
    category = "Wellness";
    tags.push("wellness", "health");
  } else if (/(camera|projector|electronic|laptop)/.test(t)) {
    category = "Electronics";
    tags.push("electronics", "gear");
  } else if (/(drill|tool|hammer|ladder)/.test(t)) {
    category = "Tools";
    tags.push("tools", "diy");
  } else if (/(music|guitar|piano|sing)/.test(t)) {
    category = "Music";
    tags.push("music", "lessons");
  }
  return delay({ category, tags });
}

// AI 5 — Notice summarizer
// TODO: connect to real AI backend summarization endpoint
export async function summarizeNotice(content: string): Promise<string> {
  const first = content.split(/[.!?]/).slice(0, 2).join(". ").trim();
  return delay(`Summary: ${first}. (Key point auto-extracted.)`);
}

// AI 6 — Complaint categorization & priority
// TODO: connect to real AI backend classification endpoint
export async function categorizeComplaint(text: string): Promise<{ category: string; priority: "low" | "medium" | "high" }> {
  const t = text.toLowerCase();
  let category = "General";
  let priority: "low" | "medium" | "high" = "low";
  if (/(noise|loud|music)/.test(t)) {
    category = "Noise";
    priority = "medium";
  } else if (/(safety|dangerous|threat|violence)/.test(t)) {
    category = "Safety";
    priority = "high";
  } else if (/(garden|park|facility|lift|elevator)/.test(t)) {
    category = "Facilities";
    priority = "low";
  } else if (/(coordinator|admin)/.test(t)) {
    category = "Conduct";
    priority = "high";
  }
  return delay({ category, priority });
}

// AI 7 — Suggest volunteers for an event
// TODO: connect to real AI backend recommendation endpoint
export async function suggestVolunteers(eventId: string) {
  const ev = __mockState.events.find((e) => e.id === eventId);
  if (!ev) return delay([]);
  const residents = __mockState.users.filter(
    (u) => u.societyId === ev.societyId && u.role === "resident" && !ev.volunteers.includes(u.id),
  );
  return delay(
    residents.slice(0, 4).map((u, i) => ({
      user: u,
      score: 90 - i * 12,
      reason:
        i === 0
          ? "Frequently volunteers and lives nearby"
          : i === 1
            ? "Has related skills listed"
            : "Active community participant",
    })),
  );
}

export type MatchResult = Awaited<ReturnType<typeof matchSkillResource>>[number];
export type NearbyResult = Awaited<ReturnType<typeof findNearbySocieties>>[number];
export type VolunteerSuggestion = Awaited<ReturnType<typeof suggestVolunteers>>[number];
