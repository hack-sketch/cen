export default {

  data() {
    return {
      search: "",
      history: [
        { id: 1, resident: "Rahul Shah", resource: "Projector", borrowedOn: "01 Jul 2026", returnedOn: "03 Jul 2026", duration: "2 Days", status: "Completed" },
        { id: 2, resident: "Priya Patel", resource: "Camping Tent", borrowedOn: "05 Jul 2026", returnedOn: "08 Jul 2026", duration: "3 Days", status: "Completed" },
        { id: 3, resident: "Amit Mehta", resource: "Speaker System", borrowedOn: "10 Jul 2026", returnedOn: "12 Jul 2026", duration: "2 Days", status: "Completed" },
        { id: 4, resident: "Neha Joshi", resource: "Cricket Kit", borrowedOn: "15 Jul 2026", returnedOn: "18 Jul 2026", duration: "3 Days", status: "Completed" }
      ]
    };
  },

  computed: {
    filteredHistory() {
      return this.history.filter(item =>
        item.resident.toLowerCase().includes(this.search.toLowerCase()) ||
        item.resource.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    exportHistory() {
      alert("Borrow history exported successfully!");
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Resource Owner Portal" rolePath="#/owner"></app-navbar>
    <app-sidebar role="owner" activePage="History"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">Borrow History</h2>
        <div>
          <button class="btn btn-success btn-sm me-2 fw-semibold" @click="exportHistory">⬇ Export History</button>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-10">
          <div class="card shadow rounded-4">
            <div class="card-body p-3">
              <input class="form-control mb-3" placeholder="Search Borrow History..." v-model="search">

              <table class="table table-hover align-middle mb-0">
                <thead class="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Resident</th>
                    <th>Resource</th>
                    <th>Borrowed On</th>
                    <th>Returned On</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredHistory" :key="item.id">
                    <td>{{ item.id }}</td>
                    <td>{{ item.resident }}</td>
                    <td>{{ item.resource }}</td>
                    <td>{{ item.borrowedOn }}</td>
                    <td>{{ item.returnedOn }}</td>
                    <td>{{ item.duration }}</td>
                    <td><span class="badge bg-success">{{ item.status }}</span></td>
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
