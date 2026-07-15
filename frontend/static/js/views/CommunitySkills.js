export default {

  data() {
    return {
      search: "",
      selectedSkill: null,
      remarks: "",
      skills: [
        { id: 1, skill: "Yoga Classes", provider: "Priya Patel", category: "Fitness", credits: 15, status: "Active", remarks: "" },
        { id: 2, skill: "Python Programming", provider: "Amit Mehta", category: "Technology", credits: 25, status: "Active", remarks: "" },
        { id: 3, skill: "Guitar Lessons", provider: "Rahul Shah", category: "Music", credits: 20, status: "Inactive", remarks: "" },
        { id: 4, skill: "Cooking Workshop", provider: "Neha Joshi", category: "Cooking", credits: 10, status: "Active", remarks: "" }
      ]
    };
  },

  computed: {
    filteredSkills() {
      return this.skills.filter(skill =>
        skill.skill.toLowerCase().includes(this.search.toLowerCase()) ||
        skill.provider.toLowerCase().includes(this.search.toLowerCase()) ||
        skill.category.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    approve(skill) {
      if (!this.remarks.trim()) {
        alert("Please enter remarks before approving.");
        return;
      }
      skill.remarks = this.remarks;
      skill.status = "Approved";
      this.selectedSkill = null;
      this.remarks = "";
    },
    reject(skill) {
      if (!this.remarks.trim()) {
        alert("Please enter remarks before rejecting.");
        return;
      }
      skill.remarks = this.remarks;
      skill.status = "Rejected";
      this.selectedSkill = null;
      this.remarks = "";
    },
    openRemarksModal(skill) {
      this.selectedSkill = skill;
      this.remarks = skill.remarks || "";
    },
    closeRemarksModal() {
      this.selectedSkill = null;
      this.remarks = "";
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Coordinator Panel" rolePath="#/coord"></app-navbar>
    <app-sidebar role="coordinator" activePage="Skills"></app-sidebar>
    
    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Skills Approvals</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Skills..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Skill</th>
                <th>Provider</th>
                <th>Category</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="skill in filteredSkills" :key="skill.id">
                <td>{{ skill.id }}</td>
                <td>{{ skill.skill }}</td>
                <td>{{ skill.provider }}</td>
                <td>{{ skill.category }}</td>
                <td>{{ skill.credits }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-success': skill.status==='Approved',
                          'bg-danger': skill.status==='Rejected',
                          'bg-warning': skill.status==='Active'
                        }">
                    {{ skill.status }}
                  </span>
                </td>
                <td>{{ skill.remarks || "-" }}</td>
                <td>
                  <button v-if="skill.status==='Active'" class="btn btn-success btn-sm me-2" @click="openRemarksModal(skill)" data-bs-toggle="modal" data-bs-target="#remarksModal">Approve</button>
                  <button v-if="skill.status==='Active'" class="btn btn-danger btn-sm" @click="openRemarksModal(skill)" data-bs-toggle="modal" data-bs-target="#remarksModal">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Remarks Modal -->
    <div class="modal fade" id="remarksModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedSkill ? selectedSkill.skill : '' }} - Enter Remarks</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" @click="closeRemarksModal"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="remarks" class="form-control" placeholder="Enter remarks..." rows="4"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeRemarksModal">Cancel</button>
            <button v-if="selectedSkill" type="button" class="btn btn-success me-2" data-bs-dismiss="modal" @click="approve(selectedSkill)">Approve</button>
            <button v-if="selectedSkill" type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="reject(selectedSkill)">Reject</button>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};