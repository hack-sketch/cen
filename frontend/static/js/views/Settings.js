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
    <app-navbar title="CEN Admin Panel" rolePath="#/admin"></app-navbar>
    <app-sidebar role="admin" activePage="Settings"></app-sidebar>

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
