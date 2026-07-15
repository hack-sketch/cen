export default {

  data() {
    return {
      search: "",
      volunteers: [
        { id: 1, event: "Tree Plantation Drive", coordinator: "Rahul Shah", volunteers: 18, date: "20 Jul 2026", status: "Open" },
        { id: 2, event: "Blood Donation Camp", coordinator: "Priya Patel", volunteers: 35, date: "05 Aug 2026", status: "Completed" },
        { id: 3, event: "Community Clean-up", coordinator: "Amit Mehta", volunteers: 22, date: "12 Aug 2026", status: "Open" },
        { id: 4, event: "Diwali Celebration", coordinator: "Neha Joshi", volunteers: 40, date: "10 Nov 2026", status: "Closed" }
      ]
    };
  },

  computed: {
    filteredVolunteers() {
      return this.volunteers.filter(activity =>
        activity.event.toLowerCase().includes(this.search.toLowerCase()) ||
        activity.coordinator.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    viewDetails(activity) {
      alert("Viewing details for " + activity.event);
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Coordinator Panel" rolePath="#/coord"></app-navbar>
    <app-sidebar role="coordinator" activePage="Volunteers"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Volunteer Management</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Volunteer Activities..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Activity</th>
                <th>Task Lead</th>
                <th>Volunteers</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in filteredVolunteers" :key="activity.id">
                <td>{{ activity.id }}</td>
                <td>{{ activity.event }}</td>
                <td>{{ activity.coordinator }}</td>
                <td>{{ activity.volunteers }}</td>
                <td>{{ activity.date }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': activity.status==='Open',
                          'bg-danger': activity.status==='Closed',
                          'bg-primary': activity.status==='Completed'
                        }">
                    {{ activity.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" @click="viewDetails(activity)">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
  `
};