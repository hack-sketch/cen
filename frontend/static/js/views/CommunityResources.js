export default {

  data() {
    return {
      search: "",
      resources: [
        { id: 1, name: "Projector", owner: "Rahul Shah", category: "Electronics", status: "Available" },
        { id: 2, name: "Camping Tent", owner: "Priya Patel", category: "Outdoor", status: "Borrowed" },
        { id: 3, name: "Speaker System", owner: "Amit Mehta", category: "Audio", status: "Available" },
        { id: 4, name: "Cricket Kit", owner: "Karan Joshi", category: "Sports", status: "Maintenance" }
      ]
    };
  },

  computed: {
    filteredResources() {
      return this.resources.filter(resource =>
        resource.name.toLowerCase().includes(this.search.toLowerCase()) ||
        resource.owner.toLowerCase().includes(this.search.toLowerCase()) ||
        resource.category.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    editResource(resource) {
      alert("Edit Resource : " + resource.name);
    },
    removeResource(resource) {
      if (confirm("Remove this resource?")) {
        this.resources = this.resources.filter(r => r.id !== resource.id);
      }
    },
    changeStatus(resource) {
      if (resource.status === "Available") resource.status = "Maintenance";
      else if (resource.status === "Maintenance") resource.status = "Borrowed";
      else resource.status = "Available";
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
          <a href="#/admin/resources" class="list-group-item list-group-item-action active">Resources</a>
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
      <h2 class="fw-bold mb-4">Community Resources</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Resources..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resource in filteredResources" :key="resource.id">
                <td>{{ resource.id }}</td>
                <td>{{ resource.name }}</td>
                <td>{{ resource.owner }}</td>
                <td>{{ resource.category }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': resource.status==='Available',
                          'bg-warning': resource.status==='Maintenance',
                          'bg-danger': resource.status==='Borrowed'
                        }">
                    {{ resource.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm me-2" @click="editResource(resource)">Edit</button>
                  <button class="btn btn-warning btn-sm me-2" @click="changeStatus(resource)">Change Status</button>
                  <button class="btn btn-danger btn-sm" @click="removeResource(resource)">Delete</button>
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
