export default {
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
          <a href="#/resident" class="list-group-item list-group-item-action active">🏠 Dashboard</a>
          <a href="#/resident/events" class="list-group-item list-group-item-action">🎉 Events</a>
          <a href="#/resident/resources" class="list-group-item list-group-item-action">📦 Resources</a>
          <a href="#/resident/volunteers" class="list-group-item list-group-item-action">🤝 Volunteers</a>
          <a href="#/resident/skills" class="list-group-item list-group-item-action">🎓 Skill Exchange</a>
          <a href="#/resident/wallet" class="list-group-item list-group-item-action">💰 Credit Wallet</a>
          <a href="#/resident/profile" class="list-group-item list-group-item-action">👤 Profile</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Resident Dashboard</h2>
      <p class="text-muted">Welcome back, Jignesh!</p>

      <!-- Stats Cards -->
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card shadow h-100 text-center rounded-4">
            <div class="card-body">
              <h2 class="text-success fw-bold mb-1">5</h2>
              <p class="mb-0">Upcoming Events</p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow h-100 text-center rounded-4">
            <div class="card-body">
              <h2 class="text-primary fw-bold mb-1">8</h2>
              <p class="mb-0">Resources Available</p>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow h-100 text-center rounded-4">
            <div class="card-body">
              <h2 class="text-warning fw-bold mb-1">120</h2>
              <p class="mb-0">Community Credits</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card mt-5 shadow h-100 rounded-4">
        <div class="card-header bg-success text-white fw-semibold rounded-top-4">
          Recent Activities
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">🌱 Registered for Tree Plantation Event</li>
          <li class="list-group-item">📽 Borrowed Projector</li>
          <li class="list-group-item">💰 Earned 20 Community Credits</li>
          <li class="list-group-item">🧘 Booked Yoga Session</li>
        </ul>
      </div>
    </div>

  </div>
  `
};
