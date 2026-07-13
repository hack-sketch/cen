export default {

  data() {
    return {
      resource: {
        name: "",
        category: "",
        description: "",
        condition: "",
        status: "Available"
      }
    };
  },

  methods: {
    saveResource() {
      alert("Resource added successfully!");
      window.location.hash = "#/owner/resources";
    },
    resetForm() {
      this.resource = {
        name: "",
        category: "",
        description: "",
        condition: "",
        status: "Available"
      };
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
        <a class="navbar-brand fw-bold ms-2" href="#/owner">Resource Owner Portal</a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">Logout</button>
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
          <a href="#/owner/resources" class="list-group-item list-group-item-action">My Resources</a>
          <a href="#/owner/add-resource" class="list-group-item list-group-item-action active">Add Resource</a>
          <a href="#/owner/requests" class="list-group-item list-group-item-action">Borrow Requests</a>
          <a href="#/owner/history" class="list-group-item list-group-item-action">Borrow History</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">Add New Resource</h2>
        <a href="#/owner/resources" class="btn btn-secondary btn-sm">← Back</a>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow rounded-4">
            <div class="card-header bg-primary text-white fw-semibold rounded-top-4">
              Resource Information
            </div>
            <div class="card-body p-3">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Resource Name</label>
                  <input type="text" class="form-control form-control-sm" v-model="resource.name" placeholder="Enter Resource Name">
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Category</label>
                  <select class="form-select form-select-sm" v-model="resource.category">
                    <option value="">Select Category</option>
                    <option>Electronics</option>
                    <option>Sports</option>
                    <option>Furniture</option>
                    <option>Books</option>
                    <option>Tools</option>
                    <option>Outdoor</option>
                    <option>Kitchen</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-semibold">Description</label>
                <textarea rows="3" class="form-control form-control-sm" v-model="resource.description" placeholder="Enter Description"></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Condition</label>
                  <select class="form-select form-select-sm" v-model="resource.condition">
                    <option value="">Select Condition</option>
                    <option>Excellent</option>
                    <option>Very Good</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Availability</label>
                  <select class="form-select form-select-sm" v-model="resource.status">
                    <option>Available</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Upload Resource Image</label>
                <input type="file" class="form-control form-control-sm">
              </div>

              <!-- Centered Buttons -->
              <div class="text-center">
                <button class="btn btn-secondary btn-sm me-3 fw-semibold" @click="resetForm">Reset</button>
                <button class="btn btn-success btn-sm fw-semibold" @click="saveResource">Save Resource</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
