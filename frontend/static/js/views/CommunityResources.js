export default {

  data() {
    return {
      search: "",
      resources: [
        { id: 1, name: "Projector", owner: "Rahul Shah", category: "Electronics", status: "Available" },
        { id: 2, name: "Camping Tent", owner: "Priya Patel", category: "Outdoor", status: "Borrowed" },
        { id: 3, name: "Speaker System", owner: "Amit Mehta", category: "Audio", status: "Available" },
        { id: 4, name: "Cricket Kit", owner: "Karan Joshi", category: "Sports", status: "Maintenance" }
      ]
    };
  },

  computed: {
    filteredResources() {
      return this.resources.filter(resource =>
        resource.name.toLowerCase().includes(this.search.toLowerCase()) ||
        resource.owner.toLowerCase().includes(this.search.toLowerCase()) ||
        resource.category.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Coordinator Panel" rolePath="#/coord"></app-navbar>
    <app-sidebar role="coordinator" activePage="Resources"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Resources Queue</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Resources..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resource in filteredResources" :key="resource.id">
                <td>{{ resource.id }}</td>
                <td>{{ resource.name }}</td>
                <td>{{ resource.owner }}</td>
                <td>{{ resource.category }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': resource.status==='Available',
                          'bg-warning': resource.status==='Maintenance',
                          'bg-danger': resource.status==='Borrowed'
                        }">
                    {{ resource.status }}
                  </span>
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