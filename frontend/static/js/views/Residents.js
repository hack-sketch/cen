export default {

  data() {
    return {
      search: "",
      residents: [
        { id: 1, name: "Jignesh Bhai", email: "jignesh@gmail.com", role: "Resident", credits: 120, status: "Active" },
        { id: 2, name: "Rahul Shah", email: "rahul@gmail.com", role: "Resource Owner", credits: 210, status: "Active" },
        { id: 3, name: "Priya Patel", email: "priya@gmail.com", role: "Skill Provider", credits: 180, status: "Inactive" },
        { id: 4, name: "Amit Mehta", email: "amit@gmail.com", role: "Resident", credits: 95, status: "Active" }
      ]
    };
  },

  computed: {
    filteredResidents() {
      return this.residents.filter(resident =>
        resident.name.toLowerCase().includes(this.search.toLowerCase()) ||
        resident.email.toLowerCase().includes(this.search.toLowerCase()) ||
        resident.role.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    toggleStatus(resident) {
      resident.status = resident.status === "Active" ? "Inactive" : "Active";
    },
    editResident(resident) {
      alert("Edit profile of " + resident.name);
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
          <a href="#/admin/residents" class="list-group-item list-group-item-action active">Residents</a>
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
      <h2 class="fw-bold mb-4">Residents Management</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Resident..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resident in filteredResidents" :key="resident.id">
                <td>{{ resident.id }}</td>
                <td>{{ resident.name }}</td>
                <td>{{ resident.email }}</td>
                <td>{{ resident.role }}</td>
                <td>{{ resident.credits }}</td>
                <td>
                  <span class="badge"
                        :class="resident.status==='Active' ? 'bg-success' : 'bg-danger'">
                    {{ resident.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm me-2" @click="editResident(resident)">Edit</button>
                  <button class="btn btn-warning btn-sm" @click="toggleStatus(resident)">
                    {{ resident.status==='Active' ? 'Deactivate' : 'Activate' }}
                  </button>
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
