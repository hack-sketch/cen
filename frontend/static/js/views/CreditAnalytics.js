export default {

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="CEN Admin Panel" rolePath="#/admin"></app-navbar>
    <app-sidebar role="admin" activePage="Analytics"></app-sidebar>

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
