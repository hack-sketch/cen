export default {

  data() {
    return {
      stats: {
        totalResources: 8,
        availableResources: 5,
        borrowedResources: 2,
        pendingRequests: 4,
        completedTransactions: 18
      },
      recentRequests: [
        { resident: "Rahul Shah", resource: "Projector", date: "18 Jul 2026", status: "Pending" },
        { resident: "Priya Patel", resource: "Camping Tent", date: "17 Jul 2026", status: "Approved" },
        { resident: "Amit Mehta", resource: "Speaker System", date: "16 Jul 2026", status: "Returned" }
      ]
    };
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#ownerSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/owner">
          Resource Owner Portal
        </a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">
          Logout
        </button>
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
          <a href="#/owner" class="list-group-item list-group-item-action active">Dashboard</a>
          <a href="#/owner/resources" class="list-group-item list-group-item-action">My Resources</a>
          <a href="#/owner/add-resource" class="list-group-item list-group-item-action">Add Resource</a>
          <a href="#/owner/requests" class="list-group-item list-group-item-action">Borrow Requests</a>
          <a href="#/owner/history" class="list-group-item list-group-item-action">Borrow History</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Resource Owner Dashboard</h2>

      <!-- Stats Cards -->
      <div class="row g-4">
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-primary">
            <div class="card-body text-center">
              <h2>{{ stats.totalResources }}</h2>
              <p>Total Resources</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-success">
            <div class="card-body text-center">
              <h2>{{ stats.availableResources }}</h2>
              <p>Available</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-warning">
            <div class="card-body text-center">
              <h2>{{ stats.borrowedResources }}</h2>
              <p>Borrowed</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-danger">
            <div class="card-body text-center">
              <h2>{{ stats.pendingRequests }}</h2>
              <p>Pending Requests</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Requests -->
      <div class="card shadow h-100 rounded-4 mt-5">
        <div class="card-header bg-primary text-white fw-semibold rounded-top-4">
          Recent Borrow Requests
        </div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Resident</th>
                <th>Resource</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in recentRequests" :key="request.resource">
                <td>{{ request.resident }}</td>
                <td>{{ request.resource }}</td>
                <td>{{ request.date }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-warning': request.status === 'Pending',
                          'bg-success': request.status === 'Approved',
                          'bg-primary': request.status === 'Returned'
                        }">
                    {{ request.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="row mt-4 g-3">
        <div class="col-md-4">
          <a href="#/owner/resources" class="btn btn-primary w-100 fw-semibold">Manage Resources</a>
        </div>
        <div class="col-md-4">
          <a href="#/owner/add-resource" class="btn btn-success w-100 fw-semibold">Add New Resource</a>
        </div>
        <div class="col-md-4">
          <a href="#/owner/requests" class="btn btn-warning w-100 fw-semibold">View Requests</a>
        </div>
      </div>
    </div>

  </div>
  `
};
