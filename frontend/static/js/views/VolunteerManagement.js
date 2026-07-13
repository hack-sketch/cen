export default {

  data() {
    return {
      search: "",
      volunteers: [
        { id: 1, event: "Tree Plantation Drive", coordinator: "Rahul Shah", volunteers: 18, date: "20 Jul 2026", status: "Open" },
        { id: 2, event: "Blood Donation Camp", coordinator: "Priya Patel", volunteers: 35, date: "05 Aug 2026", status: "Completed" },
        { id: 3, event: "Community Clean-up", coordinator: "Amit Mehta", volunteers: 22, date: "12 Aug 2026", status: "Open" },
        { id: 4, event: "Diwali Celebration", coordinator: "Neha Joshi", volunteers: 40, date: "10 Nov 2026", status: "Closed" }
      ]
    };
  },

  computed: {
    filteredVolunteers() {
      return this.volunteers.filter(activity =>
        activity.event.toLowerCase().includes(this.search.toLowerCase()) ||
        activity.coordinator.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    viewDetails(activity) {
      alert("Viewing details for " + activity.event);
    },
    toggleStatus(activity) {
      if (activity.status === "Open") activity.status = "Closed";
      else activity.status = "Open";
    },
    deleteActivity(activity) {
      if (confirm("Delete this volunteer activity?")) {
        this.volunteers = this.volunteers.filter(a => a.id !== activity.id);
      }
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-dark shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/admin">CEN Admin Panel</a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">Logout</button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="adminSidebar" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-dark">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/admin" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/admin/residents" class="list-group-item list-group-item-action">Residents</a>
          <a href="#/admin/events" class="list-group-item list-group-item-action">Events</a>
          <a href="#/admin/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/admin/skills" class="list-group-item list-group-item-action">Skills</a>
          <a href="#/admin/volunteers" class="list-group-item list-group-item-action active">Volunteer Activities</a>
          <a href="#/admin/analytics" class="list-group-item list-group-item-action">Analytics</a>
          <a href="#/admin/reports" class="list-group-item list-group-item-action">Reports</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action">Settings</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Volunteer Management</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Volunteer Activities..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Activity</th>
                <th>Coordinator</th>
                <th>Volunteers</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in filteredVolunteers" :key="activity.id">
                <td>{{ activity.id }}</td>
                <td>{{ activity.event }}</td>
                <td>{{ activity.coordinator }}</td>
                <td>{{ activity.volunteers }}</td>
                <td>{{ activity.date }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': activity.status==='Open',
                          'bg-danger': activity.status==='Closed',
                          'bg-primary': activity.status==='Completed'
                        }">
                    {{ activity.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm me-2" @click="viewDetails(activity)">View</button>
                  <button class="btn btn-warning btn-sm me-2" @click="toggleStatus(activity)" v-if="activity.status!='Completed'">
                    {{ activity.status=="Open" ? "Close" : "Reopen" }}
                  </button>
                  <button class="btn btn-danger btn-sm" @click="deleteActivity(activity)">Delete</button>
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
