export default {

  data() {
    return {
      search: "",
      residents: [
        { id: 1, name: "Jignesh Bhai", email: "jignesh@gmail.com", role: "Resident", credits: 120, status: "Active" },
        { id: 2, name: "Rahul Shah", email: "rahul@gmail.com", role: "Resource Owner", credits: 210, status: "Active" },
        { id: 3, name: "Priya Patel", email: "priya@gmail.com", role: "Skill Provider", credits: 180, status: "Inactive" },
        { id: 4, name: "Amit Mehta", email: "amit@gmail.com", role: "Coordinator", credits: 95, status: "Active" } // Set one as Coordinator for demo purposes
      ]
    };
  },

  computed: {
    filteredResidents() {
      return this.residents.filter(resident =>
        resident.name.toLowerCase().includes(this.search.toLowerCase()) ||
        resident.email.toLowerCase().includes(this.search.toLowerCase()) ||
        resident.role.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    toggleStatus(resident) {
      resident.status = resident.status === "Active" ? "Inactive" : "Active";
    },
    appointCoordinator(resident) {
      if (confirm(`Are you sure you want to promote ${resident.name} to Coordinator?`)) {
        resident.role = "Coordinator";
        alert(`${resident.name} is now a Coordinator.`);
      }
    },
    revokeCoordinator(resident) {
      if (confirm(`Are you sure you want to revoke Coordinator access for ${resident.name}?`)) {
        resident.role = "Resident"; // Defaulting demoted users back to Resident
        alert(`Coordinator access revoked for ${resident.name}.`);
      }
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="CEN Admin Panel" rolePath="#/admin"></app-navbar>
    <app-sidebar role="admin" activePage="Residents"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">User & Role Management</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Users..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resident in filteredResidents" :key="resident.id">
                <td>{{ resident.id }}</td>
                <td>{{ resident.name }}</td>
                <td>{{ resident.email }}</td>
                <td>
                  <span class="badge" 
                        :class="resident.role === 'Coordinator' ? 'bg-primary' : 'bg-secondary'">
                    {{ resident.role }}
                  </span>
                </td>
                <td>{{ resident.credits }}</td>
                <td>
                  <span class="badge"
                        :class="resident.status==='Active' ? 'bg-success' : 'bg-danger'">
                    {{ resident.status }}
                  </span>
                </td>
                <td>
                  <!-- Promote/Demote Coordinator Buttons -->
                  <button v-if="resident.role !== 'Coordinator' && resident.role !== 'Admin'" 
                          class="btn btn-info btn-sm me-2 text-white fw-semibold" 
                          @click="appointCoordinator(resident)">
                    Make Coordinator
                  </button>
                  <button v-if="resident.role === 'Coordinator'" 
                          class="btn btn-outline-danger btn-sm me-2 fw-semibold" 
                          @click="revokeCoordinator(resident)">
                    Revoke
                  </button>
                  
                  <!-- Activate/Deactivate Toggle -->
                  <button class="btn btn-sm fw-semibold" 
                          :class="resident.status==='Active' ? 'btn-warning' : 'btn-success'"
                          @click="toggleStatus(resident)">
                    {{ resident.status==='Active' ? 'Deactivate' : 'Activate' }}
                  </button>
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