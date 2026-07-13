export default {

  data() {
    return {
      event: null,
      events: [
        {
          id: 1,
          title: "Tree Plantation Drive",
          date: "20 July 2026",
          venue: "Community Garden",
          credits: 20,
          description: "Join fellow residents in planting trees to improve the community environment.",
          volunteersNeeded: 15
        },
        {
          id: 2,
          title: "Yoga Workshop",
          date: "25 July 2026",
          venue: "Community Hall",
          credits: 15,
          description: "Learn yoga techniques from experienced instructors within the community.",
          volunteersNeeded: 5
        },
        {
          id: 3,
          title: "Diwali Celebration",
          date: "10 November 2026",
          venue: "Society Ground",
          credits: 30,
          description: "Celebrate Diwali with cultural programs, food stalls and community activities.",
          volunteersNeeded: 20
        }
      ]
    };
  },

  created() {
    const eventId = parseInt(localStorage.getItem("eventId"));
    this.event = this.events.find(event => event.id === eventId);
  },

  methods: {
    rsvp() {
      alert("Successfully registered for the event!");
    },
    volunteer() {
      alert("Volunteer request submitted!");
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
    <div class="container mt-4" v-if="event">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow h-100 rounded-4">
            <div class="card-header bg-success text-white fw-semibold rounded-top-4">
              <h3>{{ event.title }}</h3>
            </div>
            <div class="card-body">
              <p><strong>📅 Date:</strong> {{ event.date }}</p>
              <p><strong>📍 Venue:</strong> {{ event.venue }}</p>
              <p><strong>💰 Community Credits:</strong> {{ event.credits }}</p>
              <p><strong>👥 Volunteers Needed:</strong> {{ event.volunteersNeeded }}</p>
              <p><strong>Description:</strong></p>
              <p>{{ event.description }}</p>
            </div>
            <div class="card-footer text-center bg-light rounded-bottom-4">
              <button class="btn btn-success me-2 fw-semibold" @click="rsvp">RSVP</button>
              <button class="btn btn-warning me-2 fw-semibold" @click="volunteer">Volunteer</button>
              <a href="#/resident/events" class="btn btn-secondary">Back</a>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
