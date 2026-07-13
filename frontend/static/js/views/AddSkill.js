export default {

  data() {
    return {
      skill: {
        name: "",
        category: "",
        description: "",
        duration: "",
        credits: "",
        level: "",
        status: "Active"
      }
    };
  },

  methods: {
    saveSkill() {
      alert("Skill added successfully!");
      window.location.hash = "#/provider/skills";
    },
    resetForm() {
      this.skill = {
        name: "",
        category: "",
        description: "",
        duration: "",
        credits: "",
        level: "",
        status: "Active"
      };
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-danger shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#providerSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/provider">Skill Provider Portal</a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">Logout</button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="providerSidebar" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-danger">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/provider" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/provider/skills" class="list-group-item list-group-item-action">My Skills</a>
          <a href="#/provider/add-skill" class="list-group-item list-group-item-action active">Add Skill</a>
          <a href="#/provider/bookings" class="list-group-item list-group-item-action">Bookings</a>
          <a href="#/provider/history" class="list-group-item list-group-item-action">Teaching History</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Add New Skill</h2>

      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow rounded-4">
            <div class="card-header bg-danger text-white fw-semibold rounded-top-4">
              Skill Information
            </div>
            <div class="card-body p-3">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Skill Name</label>
                  <input type="text" class="form-control form-control-sm" v-model="skill.name" placeholder="Enter Skill Name">
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Category</label>
                  <select class="form-select form-select-sm" v-model="skill.category">
                    <option value="">Select Category</option>
                    <option>Technology</option>
                    <option>Fitness</option>
                    <option>Music</option>
                    <option>Arts</option>
                    <option>Cooking</option>
                    <option>Education</option>
                    <option>Language</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-semibold">Description</label>
                <textarea rows="3" class="form-control form-control-sm" v-model="skill.description" placeholder="Describe your skill"></textarea>
              </div>

              <div class="row">
                <div class="col-md-4 mb-2">
                  <label class="form-label small fw-semibold">Duration</label>
                  <input type="text" class="form-control form-control-sm" v-model="skill.duration" placeholder="Example: 2 Hours">
                </div>
                <div class="col-md-4 mb-2">
                  <label class="form-label small fw-semibold">Credits Required</label>
                  <input type="number" class="form-control form-control-sm" v-model="skill.credits" placeholder="Credits">
                </div>
                <div class="col-md-4 mb-2">
                  <label class="form-label small fw-semibold">Experience Level</label>
                  <select class="form-select form-select-sm" v-model="skill.level">
                    <option value="">Select Level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Availability</label>
                  <select class="form-select form-select-sm" v-model="skill.status">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Upload Certificate (Optional)</label>
                  <input type="file" class="form-control form-control-sm">
                </div>
              </div>

              <!-- Centered Buttons -->
              <div class="text-center mt-3">
                <button class="btn btn-secondary btn-sm me-3 fw-semibold" @click="resetForm">Reset</button>
                <button class="btn btn-danger btn-sm fw-semibold" @click="saveSkill">Save Skill</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
