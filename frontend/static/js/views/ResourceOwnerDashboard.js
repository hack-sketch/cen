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
    <app-navbar title="Resource Owner Portal" rolePath="#/owner"></app-navbar>
    <app-sidebar role="owner" activePage="Dashboard"></app-sidebar>

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
