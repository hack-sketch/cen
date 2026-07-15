export default {
  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    

    <app-navbar title="Resident Portal" rolePath="#/resident"></app-navbar>
    <app-sidebar role="resident" activePage="Dashboard"></app-sidebar>

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
