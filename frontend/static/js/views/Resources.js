export default {

  data() {
    return {
      resources: [
        { id: 1, name: "Projector", owner: "Rahul Shah", category: "Electronics", status: "Available" },
        { id: 2, name: "Camping Tent", owner: "Priya Patel", category: "Outdoor", status: "Available" },
        { id: 3, name: "Speaker System", owner: "Amit Mehta", category: "Audio", status: "Borrowed" },
        { id: 4, name: "Cricket Kit", owner: "Karan Joshi", category: "Sports", status: "Available" }
      ]
    };
  },

  methods: {
    viewResource(id) {
      localStorage.setItem("resourceId", id);
      window.location.hash = "#/resident/resource";
    },
    borrow(resource) {
      if (resource.status === "Borrowed") {
        alert("This resource is currently unavailable.");
        return;
      }
      alert("Borrow request submitted successfully!");
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
          <a href="#/resident/resources" class="list-group-item list-group-item-action active">Resources</a>
          <a href="#/resident/volunteers" class="list-group-item list-group-item-action">Volunteers</a>
          <a href="#/resident/skills" class="list-group-item list-group-item-action">Skill Exchange</a>
          <a href="#/resident/wallet" class="list-group-item list-group-item-action">Credit Wallet</a>
          <a href="#/resident/profile" class="list-group-item list-group-item-action">Profile</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Resources</h2>

      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="resource in resources" :key="resource.id">
          <div class="card shadow h-100 rounded-4">
            <div class="card-body">
              <h4 class="fw-semibold text-success mb-2">{{ resource.name }}</h4>
              <p class="mb-1"><strong>Owner:</strong> {{ resource.owner }}</p>
              <p class="mb-1"><strong>Category:</strong> {{ resource.category }}</p>
              <p class="mb-1">
                <strong>Status:</strong>
                <span class="badge"
                      :class="resource.status==='Available' ? 'bg-success' : 'bg-danger'">
                  {{ resource.status }}
                </span>
              </p>
            </div>
            <div class="card-footer text-center bg-light rounded-bottom-4">
            <div class="card-footer text-center bg-light rounded-bottom-4">
              <button class="btn btn-success me-2 fw-semibold" @click="viewResource(resource.id)">View</button>
              <button class="btn btn-warning me-2 fw-semibold" @click="borrow(resource)">Borrow</button>
              
            </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
