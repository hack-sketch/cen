export default {

  data() {
    return {
      events: [
        { id: 1, title: "Tree Plantation Drive", date: "20 July 2026", venue: "Community Garden", credits: 20 },
        { id: 2, title: "Yoga Workshop", date: "25 July 2026", venue: "Community Hall", credits: 15 },
        { id: 3, title: "Diwali Celebration", date: "10 November 2026", venue: "Society Ground", credits: 30 }
      ]
    };
  },

  methods: {
    viewEvent(id) {
      localStorage.setItem("eventId", id);
      window.location.hash = "#/resident/event";
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-success shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/resident">
          🌐 Community Exchange Network
        </a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">
          Logout
        </button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="sidebarMenu" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-success">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/resident" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/resident/events" class="list-group-item list-group-item-action active">Events</a>
          <a href="#/resident/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/resident/volunteers" class="list-group-item list-group-item-action">Volunteers</a>
          <a href="#/resident/skills" class="list-group-item list-group-item-action">Skill Exchange</a>
          <a href="#/resident/wallet" class="list-group-item list-group-item-action">Credit Wallet</a>
          <a href="#/resident/profile" class="list-group-item list-group-item-action">Profile</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Events</h2>

      <div class="row g-4">
        <div class="col-md-4" v-for="event in events" :key="event.id">
          <div class="card shadow h-100">
            <div class="card-body">
              <h4 class="card-title">{{ event.title }}</h4>
              <p><strong>Date :</strong> {{ event.date }}</p>
              <p><strong>Venue :</strong> {{ event.venue }}</p>
              <p><strong>Reward :</strong> {{ event.credits }} Credits</p>
            </div>
            <div class="card-footer text-center">
              <button class="btn btn-success" @click="viewEvent(event.id)">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
