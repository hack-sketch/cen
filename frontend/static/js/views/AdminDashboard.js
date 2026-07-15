export default {

  data() {
    return {
      isLoadingStats: true,
      isLoadingAi: true,
      stats: {
        residents: 0,
        resourceOwners: 0,
        skillProviders: 0,
        events: 0,
        resources: 0,
        volunteerActivities: 0,
        totalCredits: 0
      },
      recentActivities: [],
      aiAnalytics: {
        sentiment_score: 0,
        sentiment_label: "Loading...",
        trending_tags: [],
        risk_alerts: 0
      }
    };
  },

  async mounted() {
    // 1. Fetch Standard Dashboard Stats
    try {
      const statsResponse = await axios.get("http://localhost:5000/api/admin/stats");
      this.stats = statsResponse.data.stats;
      this.recentActivities = statsResponse.data.activities;
    } catch (error) {
      console.warn("Backend stats not live. Loading fallback data.");
      this.stats = {
        residents: 245, resourceOwners: 38, skillProviders: 27,
        events: 18, resources: 96, volunteerActivities: 14, totalCredits: 5420
      };
      this.recentActivities = [
        { activity: "New resident registered", time: "10 mins ago" },
        { activity: "Tree Plantation Event created", time: "30 mins ago" },
        { activity: "Projector added to Resource Hub", time: "1 hour ago" },
        { activity: "Yoga Workshop completed", time: "Today" },
        { activity: "Monthly report generated", time: "Yesterday" }
      ];
    } finally {
      this.isLoadingStats = false;
    }

    // 2. Fetch AI Sentiment Analytics
    try {
      const aiResponse = await axios.get("http://localhost:5000/api/ai/sentiment");
      this.aiAnalytics = aiResponse.data;
    } catch (error) {
      console.warn("AI Backend not live. Loading fallback AI data.");
      this.aiAnalytics = {
        sentiment_score: 88,
        sentiment_label: "Highly Positive",
        trending_tags: ["cleanup", "python", "projector"],
        risk_alerts: 3
      };
    } finally {
      this.isLoadingAi = false;
    }
  },

  template: `
  <div class="bg-light min-vh-100">

    <app-navbar title="CEN Admin Panel" rolePath="#/admin"></app-navbar>
    <app-sidebar role="admin" activePage="Dashboard"></app-sidebar>

    <!-- Main Content -->
    <div class="container-fluid px-4 py-5" style="max-width: 1400px;">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <h2 class="fw-bold text-dark mb-0">Overview</h2>
        <span class="text-muted small">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}</span>
      </div>

      <!-- Clean AI Widget -->
      <div class="card border-0 shadow-sm rounded-4 mb-5" style="background-color: #f8f6fc;">
        <div class="card-body p-4 p-md-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h6 class="fw-bold text-uppercase tracking-wide mb-0" style="color: #5b4b8a; letter-spacing: 1px;">✨ AI Sentiment Analytics</h6>
            <div v-if="isLoadingAi" class="spinner-border spinner-border-sm" style="color: #5b4b8a;" role="status"></div>
          </div>
          
          <div class="row align-items-center g-4">
            <div class="col-md-5 border-md-end">
              <p class="text-muted small text-uppercase tracking-wide mb-1">Community Vibe</p>
              <h2 class="display-6 fw-bold mb-0" :class="aiAnalytics.sentiment_score > 70 ? 'text-success' : 'text-warning'">
                {{ aiAnalytics.sentiment_label }} <span class="fs-4 text-muted fw-normal">({{ aiAnalytics.sentiment_score }}%)</span>
              </h2>
            </div>
            <div class="col-md-7 ps-md-4">
              <p class="mb-3 text-dark">
                <strong class="fw-semibold me-2">Trending:</strong> 
                <span v-for="tag in aiAnalytics.trending_tags" :key="tag" class="badge bg-white text-dark border me-2 py-2 px-3 rounded-pill shadow-sm">#{{ tag }}</span>
              </p>
              <div class="d-flex align-items-center">
                <span v-if="aiAnalytics.risk_alerts > 0" class="badge bg-danger-subtle text-danger py-2 px-3 rounded-pill">
                  ⚠️ {{ aiAnalytics.risk_alerts }} members at risk
                </span>
                <span v-else class="badge bg-success-subtle text-success py-2 px-3 rounded-pill">
                  ✅ Stable Credit Flow
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Minimalist Stat Cards -->
      <div v-if="isLoadingStats" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status"></div>
      </div>
      <div v-else class="row g-4 mb-5">
        
        <!-- Stat Card 1 -->
        <div class="col-6 col-md-4 col-xl-2">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <p class="text-muted fw-semibold small text-uppercase mb-2" style="letter-spacing: 0.5px;">Residents</p>
              <h2 class="fw-bold text-dark mb-0">{{ stats.residents }}</h2>
            </div>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div class="col-6 col-md-4 col-xl-2">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <p class="text-muted fw-semibold small text-uppercase mb-2" style="letter-spacing: 0.5px;">Owners</p>
              <h2 class="fw-bold text-dark mb-0">{{ stats.resourceOwners }}</h2>
            </div>
          </div>
        </div>

        <!-- Stat Card 3 -->
        <div class="col-6 col-md-4 col-xl-2">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <p class="text-muted fw-semibold small text-uppercase mb-2" style="letter-spacing: 0.5px;">Providers</p>
              <h2 class="fw-bold text-dark mb-0">{{ stats.skillProviders }}</h2>
            </div>
          </div>
        </div>

        <!-- Stat Card 4 -->
        <div class="col-6 col-md-4 col-xl-2">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <p class="text-muted fw-semibold small text-uppercase mb-2" style="letter-spacing: 0.5px;">Events</p>
              <h2 class="fw-bold text-dark mb-0">{{ stats.events }}</h2>
            </div>
          </div>
        </div>

        <!-- Stat Card 5 -->
        <div class="col-6 col-md-4 col-xl-2">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <p class="text-muted fw-semibold small text-uppercase mb-2" style="letter-spacing: 0.5px;">Resources</p>
              <h2 class="fw-bold text-dark mb-0">{{ stats.resources }}</h2>
            </div>
          </div>
        </div>

        <!-- Stat Card 6 -->
        <div class="col-6 col-md-4 col-xl-2">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <p class="text-muted fw-semibold small text-uppercase mb-2" style="letter-spacing: 0.5px;">Credits</p>
              <h2 class="fw-bold text-success mb-0">{{ stats.totalCredits }}</h2>
            </div>
          </div>
        </div>

      </div>

      <!-- Clean Table Layout -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-body p-0">
          <div class="p-4 p-md-5 border-bottom border-light">
            <h5 class="fw-bold text-dark mb-0">Recent Activities</h5>
          </div>
          <div class="table-responsive px-4 pb-4">
            <table class="table table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th class="text-muted fw-semibold small text-uppercase pb-3" style="letter-spacing: 0.5px;">Activity Description</th>
                  <th class="text-muted fw-semibold small text-uppercase pb-3 text-end" style="letter-spacing: 0.5px;">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in recentActivities" :key="activity.activity" class="border-bottom border-light">
                  <td class="py-3 text-dark">{{ activity.activity }}</td>
                  <td class="py-3 text-muted text-end small">{{ activity.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
  `
};