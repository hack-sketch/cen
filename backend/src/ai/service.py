import json
import re
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from src.ai.schemas import (
    AutoTagResult,
    CategorizeComplaintResult,
    ChatbotResponsePayload,
    MatchItemResult,
    VolunteerSuggestionResult,
    SummarizeNoticeResult,
)
from src.config import settings
from src.events.models import EventItem
from src.marketplace.models import Resource, Skill
from src.societies.models import Society
from src.societies.schemas import SocietyResponse
from src.users.models import User
from src.users.schemas import UserResponse


def call_gemini_llm(
    prompt: str,
    system_instruction: Optional[str] = None,
    history: Optional[List[Any]] = None,
) -> Optional[str]:
    """Invokes Google Gemini API using official v1beta REST endpoints with model fallback."""
    api_key = settings.GEMINI_API_KEY
    if not api_key or not api_key.strip():
        return None

    models_to_try = [
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
    ]


    contents = []
    if history:
        for item in history:
            role = "user" if (getattr(item, "role", "user") == "user" or (isinstance(item, dict) and item.get("role") == "user")) else "model"
            content = getattr(item, "content", "") if hasattr(item, "content") else (item.get("content", "") if isinstance(item, dict) else str(item))
            if content:
                contents.append({"role": role, "parts": [{"text": content}]})

    contents.append({"role": "user", "parts": [{"text": prompt}]})

    payload: Dict[str, Any] = {"contents": contents}

    if system_instruction:
        payload["system_instruction"] = {
            "parts": [{"text": system_instruction}]
        }

    data_bytes = json.dumps(payload).encode("utf-8")

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key.strip()}"
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                candidates = res_body.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        text = parts[0].get("text", "").strip()
                        if text:
                            return text
        except Exception as err:
            print(f"[Gemini API Notice - {model}]: {err}")
            continue

    return None



def chatbot_query(
    db: Session,
    user: User,
    message: str,
    history: Optional[List[Any]] = None,
) -> ChatbotResponsePayload:
    # 1. Gather comprehensive live database context for RAG
    first_name = user.name.split(" ")[0] if user.name else "Resident"
    user_context = f"User: {user.name} ({user.role}), Wallet Balance: {user.credit_balance or 0} credits."

    events_context = "Upcoming Events: None"
    skills_context = "Active Skills: None"
    resources_context = "Available Resources: None"
    notices_context = "Recent Notices: None"
    complaints_context = "Active Complaints: None"
    soc_name = "Community Exchange Network"

    notices_list: List[dict] = []
    events_list: List[dict] = []
    skills_list: List[dict] = []
    resources_list: List[dict] = []
    coordinators_list: List[dict] = []

    if user.society_id:
        soc = db.query(Society).filter(Society.id == user.society_id).first()
        if soc:
            soc_name = soc.name

        # Query Coordinators & Admins
        coords = db.query(User).filter(
            User.society_id == user.society_id,
            (User.is_coordinator == True) | (User.role.in_(["admin", "owner", "coordinator"]))
        ).all()
        coordinators_list = [{"name": c.name, "email": c.email, "role": "Coordinator" if c.is_coordinator else c.role.capitalize()} for c in coords]

        # Query Notices
        try:
            from src.notices.models import Notice
            recent_notices = (
                db.query(Notice)
                .filter(Notice.society_id == user.society_id)
                .order_by(Notice.date.desc(), Notice.id.desc())
                .limit(10)
                .all()
            )
            if recent_notices:
                notices_list = [
                    {"title": n.title, "content": n.content, "category": n.category, "date": n.date, "postedBy": n.posted_by_name}
                    for n in recent_notices
                ]
                notices_context = "Recent Notices:\n" + "\n".join([f"- [{n.category}] {n.title} ({n.date}): {n.content}" for n in recent_notices])
        except Exception:
            pass

        # Query Events
        upcoming_events = (
            db.query(EventItem)
            .filter(EventItem.society_id == user.society_id, EventItem.status == "upcoming")
            .order_by(EventItem.date.asc())
            .limit(10)
            .all()
        )
        if upcoming_events:
            events_list = [{"title": e.title, "date": e.date, "description": e.description} for e in upcoming_events]
            events_context = "Upcoming Events:\n" + "\n".join([f"- '{e.title}' on {e.date}. {e.description}" for e in upcoming_events])

        # Query Skills
        approved_skills = (
            db.query(Skill)
            .filter(Skill.society_id == user.society_id, Skill.status == "approved")
            .limit(10)
            .all()
        )
        if approved_skills:
            skills_list = [{"title": s.title, "credits": s.credits, "provider": s.provider_name, "description": s.description} for s in approved_skills]
            skills_context = "Active Skills:\n" + "\n".join([f"- '{s.title}' by {s.provider_name} ({s.credits} cr)" for s in approved_skills])

        # Query Resources
        avail_resources = (
            db.query(Resource)
            .filter(Resource.society_id == user.society_id, Resource.status == "approved", Resource.available == True)
            .limit(10)
            .all()
        )
        if avail_resources:
            resources_list = [{"name": r.name, "credits": r.credits, "owner": r.owner_name, "description": r.description} for r in avail_resources]
            resources_context = "Available Resources:\n" + "\n".join([f"- '{r.name}' by {r.owner_name} ({r.credits} cr)" for r in avail_resources])

        # Query Complaints
        from src.complaints.models import Complaint
        open_complaints = (
            db.query(Complaint)
            .filter(Complaint.society_id == user.society_id, Complaint.status != "resolved")
            .limit(5)
            .all()
        )
        if open_complaints:
            complaints_context = f"Open Complaints Count: {len(open_complaints)}"

    system_instruction = (
        f"You are CEN Assistant, an intelligent, empathetic, and friendly AI assistant for '{soc_name}'. "
        f"You are talking directly with resident {user.name} ({user.role}) who currently has {user.credit_balance or 0} credits. "
        "Answer all questions dynamically, naturally, and warmly in markdown format using the community context.\n\n"
        f"Community Knowledge Base Context:\n{user_context}\n\n{notices_context}\n\n{events_context}\n\n{skills_context}\n\n{resources_context}\n\n{complaints_context}"
    )

    # 1. Attempt live Gemini LLM call with history
    llm_response = call_gemini_llm(prompt=message, system_instruction=system_instruction, history=history)
    if llm_response:
        return ChatbotResponsePayload(answer=llm_response)

    # 2. INTELLIGENT DYNAMIC SYNTHESIS ENGINE (Natural Conversational AI)
    q = message.lower().strip()

    # Personal opinions / perception questions ("wdy think of me", "what do you think of me", "opinion about me")
    if re.search(r"\b(think of me|think about me|opinion of me|opinion about me|like me|about me|wdy|wbu)\b", q):
        return ChatbotResponsePayload(
            answer=f"I think you're great, {first_name}! 😊 As an active resident of **{soc_name}** with **{user.credit_balance or 0} credits** in your wallet, you're a fantastic part of our community. I'm always happy to chat or help you with anything in the society!"
        )

    # Compliments & Affection
    if re.search(r"\b(cute|sweet|adorable|love you|love u|cutie|sweetie|awesome|amazing|cool|smart|clever|best bot)\b", q):
        return ChatbotResponsePayload(
            answer=f"Aww, thank you so much, {first_name}! 😊 You're so sweet! I'm happy to help you and everyone in **{soc_name}**. Let me know if you need anything, whether it's checking notices, borrowing tools, or community events!"
        )

    # Greetings with strict word boundaries
    if re.search(r"\b(hello|hi|hey|greetings|good morning|good evening)\b", q) and not re.search(r"\b(think|anything|something)\b", q):
        return ChatbotResponsePayload(
            answer=f"Hey {first_name}! 👋 I'm **CEN Assistant**, your AI guide for **{soc_name}**.\n\n"
            f"You currently have **{user.credit_balance or 0} credits** in your wallet. How can I help you today?"
        )

    if re.search(r"\b(how are you|how's it going|how do you do|what's up|whats up|sup)\b", q):
        return ChatbotResponsePayload(
            answer=f"Doing great, thanks {first_name}! 😊 Everything is running smoothly in **{soc_name}**.\n\n"
            f"You have **{user.credit_balance or 0} credits** in your wallet. Let me know if you need help with notices, events, or borrowing tools!"
        )

    if re.search(r"\b(thank|thanks|thx|appreciate)\b", q):
        return ChatbotResponsePayload(
            answer=f"Anytime, {first_name}! Glad I could help. Let me know if you need anything else!"
        )

    if re.search(r"\b(lol|haha|lmao|hehe|rofl)\b", q):
        return ChatbotResponsePayload(
            answer=f"Haha! 😄 Glad I could bring a smile to your day, {first_name}. Let me know if you need any community updates or helper info!"
        )

    # Coordinators & Admins
    if any(k in q for k in ["coordinator", "admin", "management", "committee", "leader"]):
        if coordinators_list:
            c_lines = "\n".join([f"• **{c['name']}** ({c['role']}) — `{c['email']}`" for c in coordinators_list])
            return ChatbotResponsePayload(
                answer=f"Here are the active coordinators and administrators for **{soc_name}**:\n\n{c_lines}\n\n"
                "You can reach out to them directly for official society queries, approval status, or community issues."
            )
        return ChatbotResponsePayload(answer=f"There are currently no coordinators assigned for **{soc_name}**.")

    # Credit System / Wallet
    if any(k in q for k in ["credit", "balance", "wallet", "earn", "spend", "token"]):
        return ChatbotResponsePayload(
            answer=f"💳 **Your Wallet & Credits in {soc_name}**:\n\n"
            f"• **Current Balance**: **{user.credit_balance or 0} credits**\n\n"
            "**How to Earn Credits:**\n"
            "1. **Offer Skills**: List tutoring, repairs, gardening, or lessons for neighbors.\n"
            "2. **Share Resources**: List tools, equipment, or appliances for borrowing.\n"
            "3. **Volunteering**: Participate in community events organized by coordinators.\n\n"
            "**How to Spend Credits:**\n"
            "Use your credits to request skills or borrow tools from fellow residents!"
        )

    # Household & Profile
    if any(k in q for k in ["profile", "household", "unit", "apartment", "my detail", "account"]):
        return ChatbotResponsePayload(
            answer=f"👤 **Here is your profile summary, {user.name}**:\n\n"
            f"• **Role**: {user.role.capitalize()}\n"
            f"• **Society**: {soc_name}\n"
            f"• **Wallet Balance**: {user.credit_balance or 0} Credits\n"
            f"• **ID Verification**: {'Verified ✅' if getattr(user, 'id_proof_verified', False) else 'Pending Verification'}\n\n"
            "You can update your personal information or upload ID verification anytime from your Account Settings."
        )

    # Marketplace / Specific search (Skills & Resources matching)
    if content_words:
        notice_matches = [
            n for n in notices_list
            if any(w in n['title'].lower() or w in n['content'].lower() for w in content_words)
        ]
        event_matches = [
            e for e in events_list
            if any(w in e['title'].lower() or w in e['description'].lower() for w in content_words)
        ]
        skill_matches = [
            s for s in skills_list
            if any(w in s['title'].lower() or w in s['description'].lower() for w in content_words)
        ]
        resource_matches = [
            r for r in resources_list
            if any(w in r['name'].lower() or w in r['description'].lower() for w in content_words)
        ]

        if notice_matches or event_matches or skill_matches or resource_matches:
            parts = []
            if notice_matches:
                formatted = "\n".join([f"• [{n['category']}] **{n['title']}** ({n['date']}): {n['content']}" for n in notice_matches])
                parts.append(f"📢 **Relevant Notices**:\n{formatted}")

            if event_matches:
                formatted = "\n".join([f"• **{e['title']}** ({e['date']}): {e['description']}" for e in event_matches])
                parts.append(f"📅 **Relevant Events**:\n{formatted}")

            if skill_matches:
                formatted = "\n".join([f"• **{s['title']}** offered by {s['provider']} ({s['credits']} cr)" for s in skill_matches])
                parts.append(f"🌟 **Neighbor Skills**:\n{formatted}")

            if resource_matches:
                formatted = "\n".join([f"• **{r['name']}** shared by {r['owner']} ({r['credits']} cr)" for r in resource_matches])
                parts.append(f"🛠️ **Available Resources**:\n{formatted}")

            return ChatbotResponsePayload(answer=f"I checked the **{soc_name}** records for you:\n\n" + "\n\n".join(parts))

    # General intent checks
    if any(k in q for k in ["notice", "announcement", "board", "bulletin", "update", "news"]):
        if notices_list:
            formatted = "\n".join([f"• [{n['category']}] **{n['title']}** ({n['date']}): {n['content']}" for n in notices_list])
            return ChatbotResponsePayload(answer=f"📢 **Recent Notice Board Announcements ({soc_name})**:\n\n{formatted}")
        return ChatbotResponsePayload(answer=f"There are no active notices posted on the **{soc_name}** board right now.")

    if any(k in q for k in ["event", "upcoming", "volunteer", "activity", "schedule", "calendar"]):
        if events_list:
            formatted = "\n".join([f"• **{e['title']}** on {e['date']} — {e['description']}" for e in events_list])
            return ChatbotResponsePayload(answer=f"📅 **Upcoming Events in {soc_name}**:\n\n{formatted}")
        return ChatbotResponsePayload(answer=f"No upcoming community events are scheduled right now in **{soc_name}**.")

    if any(k in q for k in ["resource", "borrow", "tool", "equipment", "item", "drill", "ladder"]):
        if resources_list:
            formatted = "\n".join([f"• **{r['name']}** shared by {r['owner']} ({r['credits']} cr)" for r in resources_list])
            return ChatbotResponsePayload(answer=f"🛠️ **Resources Available to Borrow ({soc_name})**:\n\n{formatted}")
        return ChatbotResponsePayload(answer=f"No items are currently listed for borrowing in **{soc_name}**. You can add your own resource on the Marketplace tab to earn credits!")

    if any(k in q for k in ["skill", "teach", "tutor", "service", "repair", "lesson", "help", "offer"]):
        if skills_list:
            formatted = "\n".join([f"• **{s['title']}** offered by {s['provider']} ({s['credits']} cr)" for s in skills_list])
            return ChatbotResponsePayload(answer=f"🌟 **Neighbor Skills Available ({soc_name})**:\n\n{formatted}")
        return ChatbotResponsePayload(answer=f"No neighbor skills are currently listed in **{soc_name}**. You can list your skills to earn community credits!")

    if any(k in q for k in ["lost", "found", "key", "wallet", "stolen", "missing", "park"]):
        return ChatbotResponsePayload(
            answer=f"I'm sorry to hear that, {first_name}! Here is what you should do:\n\n"
            f"1. **Check the Notice Board**: Neighbors frequently post lost & found items on the Notice Board.\n"
            f"2. **Contact Coordinators**: Inform the society security or coordinators ({coordinators_list[0]['name'] if coordinators_list else 'Management'}).\n"
            f"3. **Post an Announcement**: You can post a quick notice so all residents in **{soc_name}** get notified."
        )

    if any(k in q for k in ["complaint", "noise", "leak", "water", "electricity", "issue", "problem", "broken"]):
        return ChatbotResponsePayload(
            answer=f"If you're experiencing an issue in **{soc_name}**, here is how to handle it:\n\n"
            "• **File a Complaint**: Go to the **Complaints** section to log the issue with category & priority.\n"
            "• **Urgent Safety Matters**: High-priority safety complaints notify coordinators immediately.\n"
            "• **Community Help**: You can also ask neighbors in Marketplace under Repair skills!"
        )

    # Dynamic Fallback Response — Fluid, natural AI synthesis
    topic_str = f" regarding '{message.strip()}'" if len(message.strip()) > 3 else ""
    return ChatbotResponsePayload(
        answer=f"Thanks for asking{topic_str}, {first_name}!\n\n"
        f"As your AI assistant for **{soc_name}**, I can help you search active notices, check upcoming community events, look up available tools to borrow, or review your wallet balance (**{user.credit_balance or 0} credits**).\n\n"
        "Try asking me things like:\n"
        "• *'Are there any notices about parking?'*\n"
        "• *'Who are the society coordinators?'*\n"
        "• *'What tools or skills can I borrow?'*\n"
        "• *'How do I earn more credits?'*"
    )




STOPWORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "he", "him", "his", "she", "her", "hers", "it", "its", "they", "them", "their",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "can", "will", "just", "don", "should", "now", "need", "want",
    "looking", "someone", "help", "somebody", "find", "please", "service", "item", "tool",
    "something", "anybody", "get", "like"
}

SYNONYM_ONTOLOGY = {
    "Plumbing": ["plumb", "plumbing", "pipe", "pipes", "leak", "leaking", "leaky", "faucet", "sink", "tap", "bathroom", "drain", "water", "toilet", "plumber"],
    "Electrical": ["electric", "electrical", "electrician", "wire", "wiring", "light", "switch", "socket", "fan", "power", "bulb", "appliance"],
    "Tutoring": ["tutor", "tutoring", "teach", "teaching", "teacher", "lesson", "lessons", "math", "maths", "mathematics", "science", "english", "homework", "exam", "coding", "python", "study", "class", "classes", "learn"],
    "Gardening": ["garden", "gardening", "gardener", "plant", "plants", "lawn", "mow", "mower", "grass", "tree", "trim", "flower", "yard", "outdoor", "landscape", "landscaping"],
    "Wellness": ["yoga", "fitness", "workout", "gym", "health", "exercise", "train", "trainer", "meditation", "diet", "stretching", "wellness"],
    "Music": ["guitar", "piano", "sing", "singing", "drums", "music", "musical", "instrument", "song", "vocal", "acoustic"],
    "Tools": ["drill", "drilling", "hammer", "ladder", "wrench", "toolkit", "saw", "screw", "driver", "tools", "diy", "equipment", "hardware", "screwdriver"],
    "Electronics": ["laptop", "pc", "computer", "phone", "camera", "tv", "screen", "lens", "tech", "gadget", "printer", "projector", "electronics"],
    "Repair": ["fix", "fixing", "repair", "repairing", "mend", "maintenance", "assembly", "mount", "mounting", "broken", "service"],
    "Vehicles": ["car", "bike", "bicycle", "cycle", "puncture", "mechanic", "tyre", "tire", "scooter", "brake", "oil"],
    "Cleaning": ["clean", "cleaning", "wash", "washing", "mop", "sweep", "dust", "maid", "sanitize", "vacuum", "housekeeping"],
    "Cooking": ["cook", "cooking", "bake", "baking", "chef", "meal", "food", "recipe", "catering", "cake", "kitchen"],
}


def match_marketplace(db: Session, query: str, society_id: str) -> List[MatchItemResult]:
    q_raw = query.strip()
    q_lower = q_raw.lower()
    
    # 1. RETRIEVAL STEP (RAG): Retrieve all approved skills and resources in the user's society
    skills = db.query(Skill).filter(Skill.society_id == society_id, Skill.status == "approved").all()
    resources = db.query(Resource).filter(Resource.society_id == society_id, Resource.status == "approved").all()

    skills_by_id = {s.id: s for s in skills}
    resources_by_id = {r.id: r for r in resources}

    # Prepare compact catalog for LLM Augmented Generation
    catalog_items = []
    for s in skills:
        catalog_items.append({
            "id": s.id,
            "kind": "skill",
            "title": s.title,
            "category": s.category,
            "providerName": s.provider_name,
            "credits": s.credits,
            "description": s.description,
            "tags": s.tags,
        })
    for r in resources:
        catalog_items.append({
            "id": r.id,
            "kind": "resource",
            "title": r.name,
            "category": r.category,
            "ownerName": r.owner_name,
            "credits": r.credits,
            "description": r.description,
            "available": r.available,
        })

    # 2. AUGMENTED GENERATION STEP (RAG): If Gemini LLM is active, perform true semantic intent reasoning
    if catalog_items:
        rag_prompt = (
            f"You are CEN Assistant's semantic marketplace match and intent summarization engine.\n"
            f"A resident in the community searched using everyday natural language:\n"
            f"Query: \"{q_raw}\"\n\n"
            f"Here is the live community database catalog of available skills and shared resources:\n"
            f"{json.dumps(catalog_items, indent=2)}\n\n"
            "INSTRUCTIONS:\n"
            "1. Intelligently parse the resident's underlying problem, desire, or intent (e.g. 'water leaking under bathroom sink' -> matches plumbing repair, 'need something to mount pictures' -> matches drill/hammer tools).\n"
            "2. Identify the best matching catalog items (up to 8).\n"
            "3. For each match, provide:\n"
            "   - 'id': exact item ID from the catalog\n"
            "   - 'kind': 'skill' or 'resource'\n"
            "   - 'score': integer from 60 to 98 based on relevance\n"
            "   - 'reason': concise explanation of why this item satisfies the resident's request\n"
            "   - 'summary': a clear 1-2 sentence layman explanation of what is offered and how it helps\n"
            "   - 'intentTags': array of 2-3 intent tags (e.g. ['Plumbing', 'Leak Repair', 'Home DIY'])\n\n"
            "Return ONLY a JSON array of objects with keys: id, kind, score, reason, summary, intentTags.\n"
            "If no items are relevant to the user query, return []."
        )

        llm_response = call_gemini_llm(prompt=rag_prompt)
        if llm_response:
            try:
                json_match = re.search(r"\[.*\]", llm_response, re.DOTALL)
                if json_match:
                    parsed_matches = json.loads(json_match.group(0))
                    if isinstance(parsed_matches, list) and len(parsed_matches) > 0:
                        rag_results: List[MatchItemResult] = []
                        for pm in parsed_matches:
                            item_id = pm.get("id")
                            kind = pm.get("kind", "skill")
                            score = int(pm.get("score", 85))
                            reason = str(pm.get("reason", "Semantic intent match"))
                            summary = str(pm.get("summary", ""))
                            intent_tags = pm.get("intentTags", [])
                            if not isinstance(intent_tags, list):
                                intent_tags = [str(intent_tags)]

                            if kind == "skill" and item_id in skills_by_id:
                                s = skills_by_id[item_id]
                                item_dict = {
                                    "id": s.id,
                                    "title": s.title,
                                    "category": s.category,
                                    "providerId": s.provider_id,
                                    "providerName": s.provider_name,
                                    "credits": s.credits,
                                    "description": s.description,
                                    "status": s.status,
                                    "tags": [t.strip() for t in s.tags.split(",") if t.strip()] if isinstance(s.tags, str) else [],
                                    "societyId": s.society_id,
                                    "summary": summary or f"Expert {s.category} service: '{s.title}' offered by {s.provider_name}.",
                                    "intentTags": intent_tags or [s.category, "Skill Exchange"],
                                }
                                rag_results.append(
                                    MatchItemResult(
                                        item=item_dict,
                                        kind="skill",
                                        score=min(99, max(50, score)),
                                        reason=reason,
                                        summary=summary or item_dict["summary"],
                                        intent_tags=intent_tags or item_dict["intentTags"],
                                    )
                                )
                            elif kind == "resource" and item_id in resources_by_id:
                                r = resources_by_id[item_id]
                                item_dict = {
                                    "id": r.id,
                                    "name": r.name,
                                    "category": r.category,
                                    "ownerId": r.owner_id,
                                    "ownerName": r.owner_name,
                                    "available": r.available,
                                    "credits": r.credits,
                                    "status": r.status,
                                    "description": r.description,
                                    "societyId": r.society_id,
                                    "summary": summary or f"Shared {r.category} equipment: '{r.name}' available to borrow from {r.owner_name}.",
                                    "intentTags": intent_tags or [r.category, "Shared Tool"],
                                }
                                rag_results.append(
                                    MatchItemResult(
                                        item=item_dict,
                                        kind="resource",
                                        score=min(99, max(50, score)),
                                        reason=reason,
                                        summary=summary or item_dict["summary"],
                                        intent_tags=intent_tags or item_dict["intentTags"],
                                    )
                                )

                        if rag_results:
                            rag_results.sort(key=lambda x: x.score, reverse=True)
                            return rag_results[:8]
            except Exception as e:
                print(f"[Gemini RAG Matcher Exception]: {e}")

    # 3. HIGH-PRECISION HEURISTIC & SYNONYM INTENT ENGINE (Fallback if offline)
    # Extract query tokens excluding stopwords
    words = re.findall(r"\b[a-z0-9]+\b", q_lower)
    meaningful_tokens = [w for w in words if w not in STOPWORDS and len(w) > 1]
    if not meaningful_tokens:
        meaningful_tokens = [w for w in words if len(w) > 1]

    # Detect relevant intent categories from ontology
    matched_categories = set()
    for cat, synonyms in SYNONYM_ONTOLOGY.items():
        if any(token in synonyms for token in meaningful_tokens) or any(s in q_lower for s in synonyms):
            matched_categories.add(cat)

    results: List[MatchItemResult] = []

    for s in skills:
        s_title_lower = s.title.lower()
        s_desc_lower = s.description.lower()
        s_cat_lower = s.category.lower()
        tags_list = [t.strip().lower() for t in s.tags.split(",") if t.strip()] if isinstance(s.tags, str) else []

        score = 0
        matched_reasons = []

        # Exact query match
        if q_lower in s_title_lower:
            score += 45
            matched_reasons.append(f"Title matches '{q_raw}'")
        elif any(t in s_title_lower for t in meaningful_tokens):
            matching_title_tokens = [t for t in meaningful_tokens if t in s_title_lower]
            score += 25 * len(matching_title_tokens)
            matched_reasons.append(f"Keywords in title: {', '.join(matching_title_tokens)}")

        if q_lower in s_desc_lower:
            score += 30
            matched_reasons.append("Exact phrase in description")
        else:
            matching_desc_tokens = [t for t in meaningful_tokens if t in s_desc_lower]
            if matching_desc_tokens:
                score += 15 * len(matching_desc_tokens)
                matched_reasons.append(f"Description matches: {', '.join(matching_desc_tokens[:3])}")

        # Category and synonym match
        if s.category in matched_categories or s_cat_lower in q_lower or any(t in s_cat_lower for t in meaningful_tokens):
            score += 25
            matched_reasons.append(f"Category '{s.category}' matches your intent")

        # Tags match
        matching_tags = [t for t in tags_list if t in q_lower or any(token in t for token in meaningful_tokens)]
        if matching_tags:
            score += 20 * len(matching_tags)
            matched_reasons.append(f"Tags match: {', '.join(matching_tags)}")

        if score > 0:
            summary = f"Expert {s.category} service: '{s.title}' offered by {s.provider_name} ({s.credits} Credits). {s.description.strip()}"
            if len(summary) > 135:
                summary = summary[:132] + "..."

            intent_tags = list(dict.fromkeys([s.category, *matching_tags, *[c for c in matched_categories if c != s.category]]))[:3]
            if not intent_tags:
                intent_tags = [s.category, "Skill Exchange"]

            norm_score = min(98, max(55, score))
            reason = " · ".join(matched_reasons[:2]) if matched_reasons else f"Matches your search for {s.category}"

            item_dict = {
                "id": s.id,
                "title": s.title,
                "category": s.category,
                "providerId": s.provider_id,
                "providerName": s.provider_name,
                "credits": s.credits,
                "description": s.description,
                "status": s.status,
                "tags": [t.strip() for t in s.tags.split(",") if t.strip()] if isinstance(s.tags, str) else [],
                "societyId": s.society_id,
                "summary": summary,
                "intentTags": intent_tags,
            }

            results.append(
                MatchItemResult(
                    item=item_dict,
                    kind="skill",
                    score=norm_score,
                    reason=reason,
                    summary=summary,
                    intent_tags=intent_tags,
                )
            )

    # Query resources in society
    resources = db.query(Resource).filter(Resource.society_id == society_id, Resource.status == "approved").all()
    for r in resources:
        r_name_lower = r.name.lower()
        r_desc_lower = r.description.lower()
        r_cat_lower = r.category.lower()

        score = 0
        matched_reasons = []

        # Exact query match
        if q_lower in r_name_lower:
            score += 45
            matched_reasons.append(f"Resource name matches '{q_raw}'")
        elif any(t in r_name_lower for t in meaningful_tokens):
            matching_name_tokens = [t for t in meaningful_tokens if t in r_name_lower]
            score += 25 * len(matching_name_tokens)
            matched_reasons.append(f"Name matches: {', '.join(matching_name_tokens)}")

        if q_lower in r_desc_lower:
            score += 30
            matched_reasons.append("Exact phrase in item description")
        else:
            matching_desc_tokens = [t for t in meaningful_tokens if t in r_desc_lower]
            if matching_desc_tokens:
                score += 15 * len(matching_desc_tokens)
                matched_reasons.append(f"Description matches: {', '.join(matching_desc_tokens[:3])}")

        # Category and synonym match
        if r.category in matched_categories or r_cat_lower in q_lower or any(t in r_cat_lower for t in meaningful_tokens):
            score += 25
            matched_reasons.append(f"Category '{r.category}' fits your requirements")

        if score > 0:
            summary = f"Shared {r.category} equipment: '{r.name}' available to borrow from {r.owner_name} ({r.credits} Credits). {r.description.strip()}"
            if len(summary) > 135:
                summary = summary[:132] + "..."

            intent_tags = list(dict.fromkeys([r.category, "Available to Borrow", *[c for c in matched_categories if c != r.category]]))[:3]

            norm_score = min(98, max(55, score))
            reason = " · ".join(matched_reasons[:2]) if matched_reasons else f"Available resource in {r.category}"

            item_dict = {
                "id": r.id,
                "name": r.name,
                "category": r.category,
                "ownerId": r.owner_id,
                "ownerName": r.owner_name,
                "available": r.available,
                "credits": r.credits,
                "status": r.status,
                "description": r.description,
                "societyId": r.society_id,
                "summary": summary,
                "intentTags": intent_tags,
            }

            results.append(
                MatchItemResult(
                    item=item_dict,
                    kind="resource",
                    score=norm_score,
                    reason=reason,
                    summary=summary,
                    intent_tags=intent_tags,
                )
            )

    results.sort(key=lambda x: x.score, reverse=True)
    return results[:8]



def auto_tag(text: str) -> AutoTagResult:
    prompt = (
        f"Analyze the following skill or resource description:\n\"{text}\"\n"
        "Return ONLY a JSON object in this exact format: {\"category\": \"<Category>\", \"tags\": [\"tag1\", \"tag2\"]}"
    )

    llm_text = call_gemini_llm(prompt=prompt)
    if llm_text:
        try:
            # Extract JSON block
            json_match = re.search(r"\{.*\}", llm_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                cat = parsed.get("category", "General")
                tags = parsed.get("tags", [])
                if isinstance(tags, list):
                    return AutoTagResult(category=str(cat), tags=[str(t) for t in tags])
        except Exception:
            pass

    # Heuristic fallback
    t = text.lower()
    category = "General"
    tags: List[str] = []

    if re.search(r"(bike|cycle|repair|fix|plumb|electric)", t):
        category = "Repair"
        tags.extend(["repair", "diy"])
    elif re.search(r"(teach|tutor|class|math|science)", t):
        category = "Tutoring"
        tags.extend(["education", "tutoring"])
    elif re.search(r"(yoga|fitness|wellness|meditat)", t):
        category = "Wellness"
        tags.extend(["wellness", "health"])
    elif re.search(r"(camera|projector|electronic|laptop)", t):
        category = "Electronics"
        tags.extend(["electronics", "gear"])
    elif re.search(r"(drill|tool|hammer|ladder)", t):
        category = "Tools"
        tags.extend(["tools", "diy"])
    elif re.search(r"(music|guitar|piano|sing)", t):
        category = "Music"
        tags.extend(["music", "lessons"])

    return AutoTagResult(category=category, tags=tags)


def categorize_complaint(text: str) -> CategorizeComplaintResult:
    prompt = (
        f"Classify the following community complaint:\n\"{text}\"\n"
        "Return ONLY a JSON object in this format: {\"category\": \"<Category>\", \"priority\": \"<low|medium|high>\"}"
    )

    llm_text = call_gemini_llm(prompt=prompt)
    if llm_text:
        try:
            json_match = re.search(r"\{.*\}", llm_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                cat = str(parsed.get("category", "General"))
                prio = str(parsed.get("priority", "low")).lower()
                if prio in ["low", "medium", "high"]:
                    return CategorizeComplaintResult(category=cat, priority=prio)
        except Exception:
            pass

    # Fallback
    t = text.lower()
    category = "General"
    priority = "low"

    if re.search(r"(noise|loud|music)", t):
        category = "Noise"
        priority = "medium"
    elif re.search(r"(safety|dangerous|threat|violence)", t):
        category = "Safety"
        priority = "high"
    elif re.search(r"(garden|park|facility|lift|elevator)", t):
        category = "Facilities"
        priority = "low"
    elif re.search(r"(coordinator|admin)", t):
        category = "Conduct"
        priority = "high"

    return CategorizeComplaintResult(category=category, priority=priority)


def suggest_volunteers(db: Session, event_id: str) -> List[VolunteerSuggestionResult]:
    ev = db.query(EventItem).filter(EventItem.id == event_id).first()
    if not ev:
        return []

    existing_volunteers = [u.strip() for u in ev.volunteers.split(",") if u.strip()] if ev.volunteers else []

    residents = (
        db.query(User)
        .filter(User.society_id == ev.society_id, User.role == "resident")
        .all()
    )

    results: List[VolunteerSuggestionResult] = []
    for u in residents:
        if u.id in existing_volunteers:
            continue

        score = 60
        reasons = ["Active community member"]

        if u.volunteer_interest == "yes":
            score += 25
            reasons.append("High volunteer availability")

        user_resp = UserResponse.model_validate(u)
        results.append(
            VolunteerSuggestionResult(
                user=user_resp,
                score=min(99, score),
                reason=" · ".join(reasons),
            )
        )

    results.sort(key=lambda x: x.score, reverse=True)
    return results[:4]


def summarize_notice(content: str) -> SummarizeNoticeResult:
    prompt = (
        f"Provide a brief, clear, and professional one-sentence summary of the following community notice content. "
        f"Do not add any greetings or conversational fluff. Just the summary.\n\n"
        f"Content:\n\"{content}\""
    )
    llm_text = call_gemini_llm(prompt=prompt)
    if llm_text:
        return SummarizeNoticeResult(summary=llm_text.strip())

    # Heuristic fallback if Gemini API is offline/unavailable
    # Clean up and split sentences
    sentences = [s.strip() for s in re.split(r"[.!?]", content) if s.strip()]
    first_two = " ".join(sentences[:2]) if sentences else ""
    if len(first_two) > 120:
        first_two = first_two[:117] + "..."
    if not first_two:
        first_two = "Community Announcement"
    return SummarizeNoticeResult(summary=f"Notice summary: {first_two}")

