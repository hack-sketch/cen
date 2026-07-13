export default {

  data() {
    return {
      search: "",
      activities: [
        { id: 1, title: "Tree Plantation Drive", organizer: "Green Club", date: "20 Jul 2026", location: "Community Park", credits: 20, status: "Open" },
        { id: 2, title: "Blood Donation Camp", organizer: "Red Cross", date: "25 Jul 2026", location: "Community Hall", credits: 30, status: "Open" },
        { id: 3, title: "Cleanliness Drive", organizer: "Youth Group", date: "30 Jul 2026", location: "Main Street", credits: 15, status: "Closed" },
        { id: 4, title: "Food Distribution", organizer: "Helping Hands", date: "05 Aug 2026", location: "City Center", credits: 25, status: "Open" }
      ]
    };
  },

  computed: {
    filteredActivities() {
      return this.activities.filter(activity =>
        activity.title.toLowerCase().includes(this.search.toLowerCase()) ||
        activity.organizer.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    joinActivity(activity) {
      if (activity.status === "Open") {
        alert("Successfully registered for " + activity.title);
      }
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
          <a href="#/resident/events" class="list-group-item list-group-item-action">Events</a>
          <a href="#/resident/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/resident/volunteers" class="list-group-item list-group-item-action active">Volunteer Activities</a>
          <a href="#/resident/skills" class="list-group-item list-group-item-action">Skill Exchange</a>
          <a href="#/resident/wallet" class="list-group-item list-group-item-action">Credit Wallet</a>
          <a href="#/resident/profile" class="list-group-item list-group-item-action">Profile</a>
        </div>
      </div>
    </div>

    <!-- Activities Section -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Volunteer Activities</h2>

      <div class="card shadow h-100 rounded-4">
        <div class="card-body">
          <input class="form-control mb-3" placeholder="Search Volunteer Activities..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-success">
              <tr>
                <th>ID</th>
                <th>Activity</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Location</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in filteredActivities" :key="activity.id">
                <td>{{ activity.id }}</td>
                <td>{{ activity.title }}</td>
                <td>{{ activity.organizer }}</td>
                <td>{{ activity.date }}</td>
                <td>{{ activity.location }}</td>
                <td>{{ activity.credits }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': activity.status === 'Open',
                          'bg-danger': activity.status === 'Closed'
                        }">
                    {{ activity.status }}
                  </span>
                </td>
                <td>
                  <button v-if="activity.status === 'Open'"
                          class="btn btn-success btn-sm fw-semibold"
                          @click="joinActivity(activity)">
                    Join
                  </button>
                  <span v-else class="text-muted">Registration Closed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
  `
};
