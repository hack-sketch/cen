export default {

  data() {
    return {
      resource: null,
      resources: [
        {
          id: 1,
          name: "Projector",
          owner: "Rahul Shah",
          category: "Electronics",
          status: "Available",
          condition: "Excellent",
          description: "HD Projector suitable for meetings, presentations and movie nights."
        },
        {
          id: 2,
          name: "Camping Tent",
          owner: "Priya Patel",
          category: "Outdoor",
          status: "Available",
          condition: "Good",
          description: "4-person waterproof camping tent."
        },
        {
          id: 3,
          name: "Speaker System",
          owner: "Amit Mehta",
          category: "Audio",
          status: "Borrowed",
          condition: "Excellent",
          description: "Portable Bluetooth speaker with microphone."
        },
        {
          id: 4,
          name: "Cricket Kit",
          owner: "Karan Joshi",
          category: "Sports",
          status: "Available",
          condition: "Very Good",
          description: "Complete cricket kit including bat, pads and gloves."
        }
      ]
    };
  },

  created() {
    const resourceId = parseInt(localStorage.getItem("resourceId"));
    this.resource = this.resources.find(resource => resource.id === resourceId);
  },

  methods: {
    borrowResource() {
      if (this.resource.status === "Borrowed") {
        alert("This resource is currently unavailable.");
        return;
      }
      alert("Borrow request submitted successfully!");
    }
  },

  template: `
  <div>

    <!-- Navbar -->
    <nav class="navbar navbar-dark bg-success shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#/resident">
          🌐 Community Exchange Network
        </a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">
          Logout
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container mt-4" v-if="resource">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow h-100 rounded-4">
            <div class="card-header bg-success text-white fw-semibold rounded-top-4">
              <h3>{{ resource.name }}</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Owner :</strong> {{ resource.owner }}</p>
                  <p><strong>Category :</strong> {{ resource.category }}</p>
                  <p><strong>Condition :</strong> {{ resource.condition }}</p>
                </div>
                <div class="col-md-6">
                  <p>
                    <strong>Status :</strong>
                    <span class="badge"
                          :class="resource.status==='Available' ? 'bg-success' : 'bg-danger'">
                      {{ resource.status }}
                    </span>
                  </p>
                </div>
              </div>
              <hr>
              <h5>Description</h5>
              <p>{{ resource.description }}</p>
            </div>
            <div class="card-footer text-center bg-light rounded-bottom-4">
              <button class="btn btn-success fw-semibold me-3" @click="borrowResource">
                Request to Borrow
              </button>
              <a href="#/resident/resources" class="btn btn-secondary fw-semibold ms-3">
                Back
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
