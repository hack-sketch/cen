export default {

  data() {
    return {
      search: "",
      requests: [
        { id: 1, resident: "Jignesh Bhai", resource: "Projector", requestDate: "18 Jul 2026", returnDate: "20 Jul 2026", status: "Pending" },
        { id: 2, resident: "Rahul Shah", resource: "Camping Tent", requestDate: "15 Jul 2026", returnDate: "18 Jul 2026", status: "Approved" },
        { id: 3, resident: "Priya Patel", resource: "Speaker System", requestDate: "10 Jul 2026", returnDate: "12 Jul 2026", status: "Returned" },
        { id: 4, resident: "Amit Mehta", resource: "Cricket Kit", requestDate: "19 Jul 2026", returnDate: "22 Jul 2026", status: "Rejected" }
      ]
    };
  },

  computed: {
    filteredRequests() {
      return this.requests.filter(request =>
        request.resident.toLowerCase().includes(this.search.toLowerCase()) ||
        request.resource.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    approve(request) { request.status = "Approved"; },
    reject(request) { request.status = "Rejected"; },
    markReturned(request) { request.status = "Returned"; }
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
          <a href="#/owner/add-resource" class="list-group-item list-group-item-action">Add Resource</a>
          <a href="#/owner/requests" class="list-group-item list-group-item-action active">Borrow Requests</a>
          <a href="#/owner/history" class="list-group-item list-group-item-action">Borrow History</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">Borrow Requests</h2>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="card shadow rounded-4">
            <div class="card-body p-3">
              <input class="form-control mb-3" placeholder="Search Requests..." v-model="search">

              <table class="table table-hover align-middle mb-0">
                <thead class="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Resident</th>
                    <th>Resource</th>
                    <th>Requested</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in filteredRequests" :key="request.id">
                    <td>{{ request.id }}</td>
                    <td>{{ request.resident }}</td>
                    <td>{{ request.resource }}</td>
                    <td>{{ request.requestDate }}</td>
                    <td>{{ request.returnDate }}</td>
                    <td>
                      <span class="badge"
                            :class="{
                              'bg-warning': request.status==='Pending',
                              'bg-success': request.status==='Approved',
                              'bg-danger': request.status==='Rejected',
                              'bg-primary': request.status==='Returned'
                            }">
                        {{ request.status }}
                      </span>
                    </td>
                    <td>
                      <button v-if="request.status==='Pending'" class="btn btn-success btn-sm me-2" @click="approve(request)">Approve</button>
                      <button v-if="request.status==='Pending'" class="btn btn-danger btn-sm me-2" @click="reject(request)">Reject</button>
                      <button v-if="request.status==='Approved'" class="btn btn-primary btn-sm" @click="markReturned(request)">Returned</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
