export default {

  data() {
    return {
      stats: {
        residents: 245,
        resourceOwners: 38,
        skillProviders: 27,
        events: 18,
        resources: 96,
        volunteerActivities: 14,
        totalCredits: 5420
      },
      recentActivities: [
        { activity: "New resident registered", time: "10 mins ago" },
        { activity: "Tree Plantation Event created", time: "30 mins ago" },
        { activity: "Projector added to Resource Hub", time: "1 hour ago" },
        { activity: "Yoga Workshop completed", time: "Today" },
        { activity: "Monthly report generated", time: "Yesterday" }
      ]
    };
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
          <a href="#/admin" class="list-group-item list-group-item-action active">Dashboard</a>
          <a href="#/admin/residents" class="list-group-item list-group-item-action">Residents</a>
          <a href="#/admin/events" class="list-group-item list-group-item-action">Events</a>
          <a href="#/admin/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/admin/skills" class="list-group-item list-group-item-action">Skills</a>
          <a href="#/admin/volunteers" class="list-group-item list-group-item-action">Volunteer Activities</a>
          <a href="#/admin/analytics" class="list-group-item list-group-item-action">Analytics</a>
          <a href="#/admin/reports" class="list-group-item list-group-item-action">Reports</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action">Settings</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Admin Dashboard</h2>

      <!-- Stats Cards -->
      <div class="row g-4">
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-primary">
            <div class="card-body text-center">
              <h2>{{ stats.residents }}</h2>
              <p>Total Residents</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-success">
            <div class="card-body text-center">
              <h2>{{ stats.resourceOwners }}</h2>
              <p>Resource Owners</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-warning">
            <div class="card-body text-center">
              <h2>{{ stats.skillProviders }}</h2>
              <p>Skill Providers</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-danger">
            <div class="card-body text-center">
              <h2>{{ stats.events }}</h2>
              <p>Events</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-info">
            <div class="card-body text-center">
              <h2>{{ stats.resources }}</h2>
              <p>Resources</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-secondary">
            <div class="card-body text-center">
              <h2>{{ stats.volunteerActivities }}</h2>
              <p>Volunteer Activities</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-dark">
            <div class="card-body text-center">
              <h2>{{ stats.totalCredits }}</h2>
              <p>Community Credits</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card shadow rounded-4 mt-5">
        <div class="card-header bg-dark text-white fw-semibold rounded-top-4">
          Recent Activities
        </div>
        <div class="card-body p-3">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Activity</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in recentActivities" :key="activity.activity">
                <td>{{ activity.activity }}</td>
                <td>{{ activity.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
  `
};
