export default {

  data() {
    return {
      user: {
        name: "Jignesh Bhai",
        email: "jignesh@example.com",
        phone: "9876543210",
        society: "Green Valley Residency",
        role: "Resident",
        credits: 120
      }
    };
  },

  methods: {
    saveProfile() {
      alert("Profile updated successfully!");
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Resident Portal" rolePath="#/resident"></app-navbar>
    <app-sidebar role="resident" activePage="Profile"></app-sidebar>

    <!-- Profile Section -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">My Profile</h2>

      <div class="row g-4">

        <!-- Profile Card -->
        <div class="col-md-4">
          <div class="card shadow h-100 rounded-4 text-center">
            <div class="card-body">
              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                   class="rounded-circle mb-3 shadow-sm"
                   width="120" alt="Profile Photo">

              <h4 class="fw-semibold mb-1">{{ user.name }}</h4>
              <p class="text-muted mb-1">{{ user.role }}</p>
              <h6 class="text-success fw-bold mb-3">{{ user.credits }} Credits</h6>

              <button class="btn btn-outline-success btn-sm">
                Change Photo
              </button>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="col-md-8">
          <div class="card shadow h-100 rounded-4">
            <div class="card-header bg-success text-white fw-semibold rounded-top-4">
              Personal Information
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label small fw-semibold">Full Name</label>
                  <input class="form-control form-control-sm" v-model="user.name">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label small fw-semibold">Email</label>
                  <input class="form-control form-control-sm" v-model="user.email">
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label small fw-semibold">Phone</label>
                  <input class="form-control form-control-sm" v-model="user.phone">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label small fw-semibold">Society</label>
                  <input class="form-control form-control-sm" v-model="user.society">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Role</label>
                <input class="form-control form-control-sm" :value="user.role" disabled>
              </div>

              <button class="btn btn-success fw-semibold" @click="saveProfile">
                Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
  `
};
