export default {

  data() {
    return {
      search: "",
      selectedResource: null,
      resources: [
        { id: 1, name: "Projector", category: "Electronics", condition: "Excellent", status: "Available", borrower: null, overdueDate: null },
        { id: 2, name: "Camping Tent", category: "Outdoor", condition: "Good", status: "Borrowed", borrower: "Jignesh Bhai", overdueDate: "18 Jul 2026", isOverdue: true },
        { id: 3, name: "Speaker System", category: "Audio", condition: "Very Good", status: "Available", borrower: null, overdueDate: null },
        { id: 4, name: "Cricket Kit", category: "Sports", condition: "Good", status: "Maintenance", borrower: null, overdueDate: null }
      ]
    };
  },

  computed: {
    filteredResources() {
      return this.resources.filter(resource =>
        resource.name.toLowerCase().includes(this.search.toLowerCase()) ||
        resource.category.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    addResource() {
      window.location.hash = "#/owner/add-resource";
    },
    editResource(resource) {
      alert("Edit " + resource.name);
    },
    deleteResource(resource) {
      if (confirm("Delete this resource?")) {
        this.resources = this.resources.filter(r => r.id !== resource.id);
      }
    },
    changeStatus(resource) {
      if (resource.status === "Available") {
        resource.status = "Maintenance";
      } else if (resource.status === "Maintenance") {
        resource.status = "Borrowed";
      } else {
        resource.status = "Available";
      }
    },
    reportOverdue(resource) {
      this.selectedResource = resource;
    },
    sendReminder(resource) {
      alert(`Reminder sent to ${resource.borrower} to return "${resource.name}"`);
      this.selectedResource = null;
    },
    escalateIssue(resource) {
      alert(`Issue escalated: "${resource.name}" not returned by ${resource.borrower} since ${resource.overdueDate}`);
      this.selectedResource = null;
    },
    closeOverdueModal() {
      this.selectedResource = null;
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Resource Owner Portal" rolePath="#/owner"></app-navbar>
    <app-sidebar role="owner" activePage="My Resources"></app-sidebar>
 
<!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">My Resources</h2>

      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-success fw-semibold me-2" @click="addResource">Add Resource</button>
      </div>

      <div class="card shadow h-100 rounded-4">
        <div class="card-body">
          <input class="form-control mb-3" placeholder="Search Resource..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-primary">
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Borrower</th>
                <th>Overdue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resource in filteredResources" :key="resource.id">
                <td>{{ resource.id }}</td>
                <td>{{ resource.name }}</td>
                <td>{{ resource.category }}</td>
                <td>{{ resource.condition }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': resource.status === 'Available',
                          'bg-warning': resource.status === 'Maintenance',
                          'bg-danger': resource.status === 'Borrowed'
                        }">
                    {{ resource.status }}
                  </span>
                </td>
                <td>{{ resource.borrower || "-" }}</td>
                <td v-if="resource.isOverdue">
                  <span class="badge bg-danger">{{ resource.overdueDate }}</span>
                </td>
                <td v-else>-</td>
                <td>
                  <button v-if="!resource.isOverdue" class="btn btn-primary btn-sm me-2" @click="editResource(resource)">Edit</button>
                  <button v-if="!resource.isOverdue" class="btn btn-warning btn-sm me-2" @click="changeStatus(resource)">Status</button>
                  <button v-if="!resource.isOverdue" class="btn btn-danger btn-sm" @click="deleteResource(resource)">Delete</button>
                  <button v-if="resource.isOverdue" class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#overdueModal" @click="reportOverdue(resource)">Handle Overdue</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Overdue Item Modal -->
    <div class="modal fade" id="overdueModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Handle Overdue Item</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" @click="closeOverdueModal"></button>
          </div>
          <div v-if="selectedResource" class="modal-body">
            <p><strong>Resource:</strong> {{ selectedResource.name }}</p>
            <p><strong>Borrower:</strong> {{ selectedResource.borrower }}</p>
            <p><strong>Overdue Since:</strong> {{ selectedResource.overdueDate }}</p>
            <p class="text-danger"><strong>This item was not returned on time!</strong></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeOverdueModal">Cancel</button>
            <button v-if="selectedResource" type="button" class="btn btn-warning me-2" data-bs-dismiss="modal" @click="sendReminder(selectedResource)">Send Reminder</button>
            <button v-if="selectedResource" type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="escalateIssue(selectedResource)">Escalate Issue</button>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
