export default {

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-dark shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/admin">CEN Admin Panel</a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">Logout</button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="adminSidebar" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-dark">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/admin" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/admin/residents" class="list-group-item list-group-item-action">Residents</a>
          <a href="#/admin/events" class="list-group-item list-group-item-action">Events</a>
          <a href="#/admin/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/admin/skills" class="list-group-item list-group-item-action">Skills</a>
          <a href="#/admin/volunteers" class="list-group-item list-group-item-action">Volunteer Activities</a>
          <a href="#/admin/analytics" class="list-group-item list-group-item-action active">Analytics</a>
          <a href="#/admin/reports" class="list-group-item list-group-item-action">Reports</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action">Settings</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Analytics</h2>

      <!-- Stats Cards -->
      <div class="row g-4">
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-primary">
            <div class="card-body text-center">
              <h2>245</h2>
              <p>Total Residents</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-success">
            <div class="card-body text-center">
              <h2>18</h2>
              <p>Total Events</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-warning">
            <div class="card-body text-center">
              <h2>96</h2>
              <p>Resources Shared</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow rounded-4 border-danger">
            <div class="card-body text-center">
              <h2>5420</h2>
              <p>Total Credits</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="row mt-5">
        <div class="col-lg-6 mb-4">
          <div class="card shadow rounded-4">
            <div class="card-header bg-success text-white fw-semibold rounded-top-4">Monthly Events</div>
            <div class="card-body">
              <canvas id="eventChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-6 mb-4">
          <div class="card shadow rounded-4">
            <div class="card-header bg-primary text-white fw-semibold rounded-top-4">Credit Distribution</div>
            <div class="card-body">
              <canvas id="creditChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `,

  mounted() {
    new Chart(document.getElementById("eventChart"), {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          label: "Events",
          data: [4, 6, 5, 8, 10, 7],
          backgroundColor: "#198754"
        }]
      }
    });

    new Chart(document.getElementById("creditChart"), {
      type: "pie",
      data: {
        labels: ["Residents", "Skill Providers", "Resource Owners"],
        datasets: [{
          data: [2500, 1700, 1220],
          backgroundColor: ["#0d6efd", "#dc3545", "#ffc107"]
        }]
      }
    });
  }
};
