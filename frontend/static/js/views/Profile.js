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
          <a href="#/resident/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/resident/volunteers" class="list-group-item list-group-item-action">Volunteers</a>
          <a href="#/resident/skills" class="list-group-item list-group-item-action">Skill Exchange</a>
          <a href="#/resident/wallet" class="list-group-item list-group-item-action">Credit Wallet</a>
          <a href="#/resident/profile" class="list-group-item list-group-item-action active">Profile</a>
        </div>
      </div>
    </div>

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
