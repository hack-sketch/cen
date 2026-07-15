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
    <app-navbar title="Resident Portal" rolePath="#/resident"></app-navbar>
    <app-sidebar role="resident" activePage="Resources"></app-sidebar>

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
