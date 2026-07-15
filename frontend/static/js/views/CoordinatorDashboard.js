export default {
  data() {
    return {
      sentiment: {
        score: 88,
        label: "Highly Positive",
        trending: ["cleanup", "python"],
        insight: "Slight drop in sentiment regarding 'late arrivals'."
      },
      pendingActions: [
        { id: 1, type: "Resource", title: "Projector booking", requester: "Ravi", context: "community event" },
        { id: 2, type: "Skill", title: "Beginner guitar lessons", requester: "Anil", context: "new listing" }
      ]
    };
  },
  methods: {
    approve(action) {
      alert(`Approved: ${action.title}`);
      this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
    },
    reject(action) {
      alert(`Rejected: ${action.title}`);
      this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
    }
  },
  template: `
  <div class="bg-light min-vh-100 pb-5">
    
    <app-navbar title="Coordinator Panel" rolePath="#/coord"></app-navbar>
    <app-sidebar role="coordinator" activePage="Dashboard"></app-sidebar>

    <div class="container mt-4" style="max-width: 800px;">
      
      <!-- Quick Filters -->
      <div class="d-flex flex-wrap gap-2 mb-4">
        <span class="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm">Approvals</span>
        <span class="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm">Verify</span>
        <span class="badge" style="background-color: #ece9f5; color: #5b4b8a; border: 1px solid #c9bfe6; padding: 0.5rem 1rem; border-radius: 50rem;">
          ✨ Participation
        </span>
      </div>
      
      <!-- AI Sentiment Dashboard -->
      <div class="p-4 rounded-4 border border-dashed mb-4 shadow-sm" style="background-color: #ece9f5; border-color: #b7abdd;">
        <div class="d-flex align-items-center mb-2">
          <span class="fs-5 me-2">🔮</span>
          <h6 class="fw-bold mb-0" style="color: #5b4b8a;">Sentiment Dashboard</h6>
        </div>
        <p class="mb-1" style="color: #4a3d73;">
          Overall Vibe: <span class="fw-bold" style="color: #2f6f5b;">{{ sentiment.label }} ({{ sentiment.score }}%)</span>
        </p>
        <p class="small mb-0" style="color: #4a3d73; opacity: 0.9;">
          Trending: <span v-for="tag in sentiment.trending" :key="tag" class="fw-semibold me-1">#{{ tag }}</span>. 
          {{ sentiment.insight }}
        </p>
      </div>

      <!-- Needs your action -->
      <h6 class="fw-bold text-muted mb-3 text-uppercase" style="letter-spacing: 0.5px; font-size: 0.85rem;">Needs your action</h6>
      
      <div v-if="pendingActions.length === 0" class="text-muted small p-3 bg-white rounded-3 border">
        No pending actions. You're all caught up!
      </div>
      
      <div class="card border-0 shadow-sm rounded-4 mb-3" v-for="action in pendingActions" :key="action.id">
        <div class="card-body p-3 p-md-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h6 class="fw-bold mb-1">{{ action.title }}</h6>
              <div class="small text-muted">{{ action.requester }} · {{ action.context }}</div>
            </div>
            <div class="d-flex gap-2 w-100 w-md-auto">
              <button class="btn btn-outline-danger btn-sm fw-semibold flex-grow-1" @click="reject(action)">Reject</button>
              <button class="btn btn-success btn-sm fw-semibold flex-grow-1" @click="approve(action)">Approve</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  `
};