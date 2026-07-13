export default {

  data() {
    return {
      opportunities: [
        { id: 1, title: "Tree Plantation Drive", date: "20 July 2026", credits: 20, slots: 8 },
        { id: 2, title: "Community Clean-up", date: "28 July 2026", credits: 15, slots: 12 },
        { id: 3, title: "Diwali Celebration", date: "10 November 2026", credits: 30, slots: 25 }
      ]
    };
  },

  methods: {
    apply(opportunity) {
      alert("You have successfully applied for '" + opportunity.title + "' as a volunteer.");
    }
  },

  template: `
  <div>

    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-success shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#/resident">
          🌐 Community Exchange Network
        </a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">
          Logout
        </button>
      </div>
    </nav>

    <!-- Opportunities Section -->
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Volunteer Opportunities</h2>
        <a href="#/resident" class="btn btn-outline-success btn-sm">← Back</a>
      </div>

      <div class="row g-4">
        <div class="col-md-4" v-for="opportunity in opportunities" :key="opportunity.id">
          <div class="card shadow-sm border-0 rounded-4 h-100">
            <div class="card-body">
              <h4 class="fw-semibold text-success mb-2">{{ opportunity.title }}</h4>
              <p class="mb-1"><span class="text-muted">📅 Date:</span> {{ opportunity.date }}</p>
              <p class="mb-1"><span class="text-muted">💰 Reward:</span> {{ opportunity.credits }} Credits</p>
              <p class="mb-3"><span class="text-muted">👥 Slots:</span> {{ opportunity.slots }}</p>
            </div>
            <div class="card-footer bg-light border-0 text-center rounded-bottom-4">
              <button class="btn btn-success btn-sm fw-semibold" @click="apply(opportunity)">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
