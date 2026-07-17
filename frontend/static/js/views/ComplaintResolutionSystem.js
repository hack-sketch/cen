export default {

  data() {
    return {
      search: "",
      filterStatus: "All",
      newComplaint: {
        title: "",
        description: "",
        category: "General"
      },
      complaints: [
        { id: 1, title: "Noise complaint", description: "Loud noise from neighbor's apartment late at night", category: "Noise", status: "Open", date: "15 Jul 2026", priority: "High", resolution: "" },
        { id: 2, title: "Parking issue", description: "Someone parked in my reserved spot", category: "Parking", status: "In Progress", date: "14 Jul 2026", priority: "Medium", resolution: "Looking into the matter" },
        { id: 3, title: "Water leakage", description: "Water leaking from apartment 5B", category: "Maintenance", status: "Resolved", date: "10 Jul 2026", priority: "High", resolution: "Plumber fixed the issue" },
        { id: 4, title: "Damaged common area", description: "Damage to the community hall entrance", category: "Facility", status: "Open", date: "13 Jul 2026", priority: "Medium", resolution: "" }
      ],
      selectedComplaint: null,
      aiSummary: null,
      isGeneratingAi: false
    };
  },

  computed: {
    filteredComplaints() {
      return this.complaints.filter(complaint => {
        const matchesSearch = complaint.title.toLowerCase().includes(this.search.toLowerCase()) ||
                             complaint.description.toLowerCase().includes(this.search.toLowerCase());
        const matchesStatus = this.filterStatus === "All" || complaint.status === this.filterStatus;
        return matchesSearch && matchesStatus;
      });
    },
    currentRole() {
      const hash = window.location.hash;
      if (hash.startsWith('#/admin')) return 'admin';
      if (hash.startsWith('#/coord')) return 'coordinator';
      if (hash.startsWith('#/resident')) return 'resident';
      if (hash.startsWith('#/owner')) return 'owner';
      if (hash.startsWith('#/provider')) return 'provider';
      return 'resident'; // fallback
    },
    rolePath() {
      const hash = window.location.hash;
      if (hash.startsWith('#/admin')) return '#/admin';
      if (hash.startsWith('#/coord')) return '#/coord';
      if (hash.startsWith('#/resident')) return '#/resident';
      if (hash.startsWith('#/owner')) return '#/owner';
      if (hash.startsWith('#/provider')) return '#/provider';
      return '#/resident'; // fallback
    }
  },

  methods: {
    fileComplaint() {
      if (!this.newComplaint.title || !this.newComplaint.description) {
        alert("Please fill in title and description.");
        return;
      }
      const complaint = {
        id: Math.max(...this.complaints.map(c => c.id)) + 1,
        title: this.newComplaint.title,
        description: this.newComplaint.description,
        category: this.newComplaint.category,
        status: "Open",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        priority: "Medium",
        resolution: ""
      };
      this.complaints.unshift(complaint);
      this.newComplaint = { title: "", description: "", category: "General" };
      alert("Complaint filed successfully! Reference ID: " + complaint.id);
    },
    
    getStatusBadgeClass(status) {
      return {
        'bg-warning': status === 'Open',
        'bg-info': status === 'In Progress',
        'bg-success': status === 'Resolved'
      };
    },
    
    getPriorityBadgeClass(priority) {
      return {
        'bg-danger': priority === 'High',
        'bg-warning': priority === 'Medium',
        'bg-secondary': priority === 'Low'
      };
    },
    
    async viewDetails(complaint) {
      this.selectedComplaint = complaint;
      this.aiSummary = null;
      this.isGeneratingAi = true;
      
      // Initialize Bootstrap Modal
      const modalElement = document.getElementById('complaintModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();

      try {
        // 1. Try fetching real AI analysis from backend
        const response = await axios.post("http://localhost:5000/api/ai/complaint-summary", {
          id: complaint.id
        });
        this.aiSummary = response.data;
      } catch (error) {
        console.warn("Backend not live yet. Loading fallback AI summary.");
        
        // 2. Fallback Data with a slight timeout to simulate network processing
        setTimeout(() => {
          this.aiSummary = {
            provider_claim: "Neighbor states they were asleep and no music was playing.",
            requester_claim: complaint.description,
            system_log: "Security noise sensors triggered briefly at 11:45 PM."
          };
          this.isGeneratingAi = false;
        }, 1200);
        return;
      }
      this.isGeneratingAi = false;
    },
    
    deleteComplaint(complaint) {
      if (confirm("Delete this complaint?")) {
        this.complaints = this.complaints.filter(c => c.id !== complaint.id);
      }
    },

    resolveDispute(action) {
      alert("Dispute action logged: " + action);
      const modalElement = document.getElementById('complaintModal');
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
    }
  },

  template: `
  <div>

    <!-- Navbar -->
    <app-navbar title="Community Portal" :rolePath="rolePath"></app-navbar>
    <app-sidebar :role="currentRole" activePage="Complaints"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">🚨 Complaint Resolution System</h2>

      <!-- File Complaint Form -->
      <div class="card shadow rounded-4 mb-4">
        <div class="card-body p-4">
          <h5 class="card-title fw-bold mb-3">File a Complaint</h5>
          <div class="mb-3">
            <label class="form-label fw-semibold">Title</label>
            <input type="text" class="form-control" placeholder="Brief title of the complaint" v-model="newComplaint.title">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Category</label>
            <select class="form-select" v-model="newComplaint.category">
              <option value="General">General</option>
              <option value="Noise">Noise</option>
              <option value="Parking">Parking</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Facility">Facility Damage</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Description</label>
            <textarea class="form-control" placeholder="Describe your complaint in detail..." v-model="newComplaint.description" rows="4"></textarea>
          </div>
          <button class="btn btn-danger fw-semibold" @click="fileComplaint">File Complaint</button>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="row mb-3">
        <div class="col-md-6">
          <input class="form-control" placeholder="Search complaints..." v-model="search">
        </div>
        <div class="col-md-6">
          <select class="form-select" v-model="filterStatus">
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <!-- Complaints Table -->
      <div class="card shadow rounded-4 mb-5">
        <div class="card-body p-3">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="complaint in filteredComplaints" :key="complaint.id">
                <td><strong>#{{ complaint.id }}</strong></td>
                <td>{{ complaint.title }}</td>
                <td>{{ complaint.category }}</td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(complaint.status)">
                    {{ complaint.status }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getPriorityBadgeClass(complaint.priority)">
                    {{ complaint.priority }}
                  </span>
                </td>
                <td>{{ complaint.date }}</td>
                <td>
                  <button class="btn btn-info btn-sm me-2 text-white fw-semibold" @click="viewDetails(complaint)">View</button>
                  <button v-if="currentRole === 'coordinator'" class="btn btn-danger btn-sm fw-semibold" @click="deleteComplaint(complaint)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- AI Dispute Resolution Modal -->
    <div class="modal fade" id="complaintModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          
          <div class="modal-header border-bottom-0 pb-0" v-if="selectedComplaint">
            <h5 class="modal-title fw-bold">Dispute #{{ selectedComplaint.id }}: {{ selectedComplaint.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          
          <div class="modal-body" v-if="selectedComplaint">
            <!-- Loading State -->
            <div v-if="isGeneratingAi" class="text-center py-4">
              <div class="spinner-border text-primary mb-2" role="status"></div>
              <p class="text-muted small mb-0">AI analyzing dispute claims...</p>
            </div>
            
            <!-- AI Summary Box -->
            <div v-else-if="aiSummary" class="p-3 rounded-4 border border-dashed mb-3" style="background-color: #ece9f5; border-color: #b7abdd; color: #4a3d73;">
              <div class="fw-bold mb-2" style="color: #5b4b8a;">🤖 AI Neutral Case Breakdown</div>
              <div class="small">
                <p class="mb-1"><strong>Provider Claim:</strong> {{ aiSummary.provider_claim }}</p>
                <p class="mb-2"><strong>Requester Claim:</strong> {{ aiSummary.requester_claim }}</p>
                <hr class="my-2" style="border-color: #c9bfe6;">
                <span style="color: #6b726c;"><em>System Log Check:</em> {{ aiSummary.system_log }}</span>
              </div>
            </div>

            <p class="small text-muted mb-0">Original Description: {{ selectedComplaint.description }}</p>
          </div>
          
          <div class="modal-footer border-top-0 pt-0 justify-content-center d-flex gap-2">
            <template v-if="currentRole === 'coordinator'">
              <button type="button" class="btn btn-light border flex-fill fw-semibold text-secondary" @click="resolveDispute('Dismiss')">Dismiss</button>
              <button type="button" class="btn btn-primary flex-fill fw-semibold" @click="resolveDispute('Split 50/50')">Split 50/50</button>
              <button type="button" class="btn btn-danger flex-fill fw-semibold" @click="resolveDispute('Refund')">Refund User</button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-secondary w-100 fw-semibold text-white" data-bs-dismiss="modal">Close</button>
            </template>
          </div>

        </div>
      </div>
    </div>

  </div>
  `
};