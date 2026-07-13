export default {

  data() {
    return {
      search: "",
      resources: [
        { id: 1, name: "Projector", category: "Electronics", condition: "Excellent", status: "Available" },
        { id: 2, name: "Camping Tent", category: "Outdoor", condition: "Good", status: "Borrowed" },
        { id: 3, name: "Speaker System", category: "Audio", condition: "Very Good", status: "Available" },
        { id: 4, name: "Cricket Kit", category: "Sports", condition: "Good", status: "Maintenance" }
      ]
    };
  },

  computed: {
    filteredResources() {
      return this.resources.filter(resource =>
        resource.name.toLowerCase().includes(this.search.toLowerCase()) ||
        resource.category.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    addResource() {
      window.location.hash = "#/owner/add-resource";
    },
    editResource(resource) {
      alert("Edit " + resource.name);
    },
    deleteResource(resource) {
      if (confirm("Delete this resource?")) {
        this.resources = this.resources.filter(r => r.id !== resource.id);
      }
    },
    changeStatus(resource) {
      if (resource.status === "Available") {
        resource.status = "Maintenance";
      } else if (resource.status === "Maintenance") {
        resource.status = "Borrowed";
      } else {
        resource.status = "Available";
      }
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#ownerSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/owner">
          Resource Owner Portal
        </a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">
          Logout
        </button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="ownerSidebar" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-primary">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/owner" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/owner/resources" class="list-group-item list-group-item-action active">My Resources</a>
          <a href="#/owner/add-resource" class="list-group-item list-group-item-action">Add Resource</a>
          <a href="#/owner/requests" class="list-group-item list-group-item-action">Borrow Requests</a>
          <a href="#/owner/history" class="list-group-item list-group-item-action">Borrow History</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">My Resources</h2>

      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-success fw-semibold me-2" @click="addResource">Add Resource</button>
      </div>

      <div class="card shadow h-100 rounded-4">
        <div class="card-body">
          <input class="form-control mb-3" placeholder="Search Resource..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-primary">
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resource in filteredResources" :key="resource.id">
                <td>{{ resource.id }}</td>
                <td>{{ resource.name }}</td>
                <td>{{ resource.category }}</td>
                <td>{{ resource.condition }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': resource.status === 'Available',
                          'bg-warning': resource.status === 'Maintenance',
                          'bg-danger': resource.status === 'Borrowed'
                        }">
                    {{ resource.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm me-2" @click="editResource(resource)">Edit</button>
                  <button class="btn btn-warning btn-sm me-2" @click="changeStatus(resource)">Status</button>
                  <button class="btn btn-danger btn-sm" @click="deleteResource(resource)">Delete</button>
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
