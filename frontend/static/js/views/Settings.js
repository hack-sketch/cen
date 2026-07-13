export default {

  data() {
    return {
      settings: {
        communityName: "Green Valley Residency",
        adminEmail: "admin@community.com",
        notifications: true,
        maintenanceMode: false
      }
    };
  },

  methods: {
    saveSettings() {
      alert("Settings saved successfully!");
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
          <a href="#/admin/volunteers" class="list-group-item list-group-item-action">Volunteer Activities</a>
          <a href="#/admin/analytics" class="list-group-item list-group-item-action">Analytics</a>
          <a href="#/admin/reports" class="list-group-item list-group-item-action">Reports</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action active">Settings</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Settings</h2>

      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow rounded-4">
            <div class="card-body p-4">
              <div class="mb-3">
                <label class="form-label fw-semibold">Community Name</label>
                <input class="form-control" v-model="settings.communityName">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Admin Email</label>
                <input type="email" class="form-control" v-model="settings.adminEmail">
              </div>

              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" v-model="settings.notifications">
                <label class="form-check-label">Enable Notifications</label>
              </div>

              <div class="form-check form-switch mb-4">
                <input class="form-check-input" type="checkbox" v-model="settings.maintenanceMode">
                <label class="form-check-label">Maintenance Mode</label>
              </div>

              <!-- Centered Save Button -->
              <div class="text-center">
                <button class="btn btn-success fw-semibold" @click="saveSettings">Save Settings</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
