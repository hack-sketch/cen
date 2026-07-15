export default {

  data() {
    return {
      search: "",
      skills: [
        { id: 1, name: "Python Programming", category: "Technology", credits: 25, duration: "2 Hours", status: "Active" },
        { id: 2, name: "Web Development", category: "Technology", credits: 30, duration: "3 Hours", status: "Active" },
        { id: 3, name: "Yoga Classes", category: "Fitness", credits: 15, duration: "1 Hour", status: "Inactive" },
        { id: 4, name: "Photography", category: "Arts", credits: 20, duration: "2 Hours", status: "Active" }
      ]
    };
  },

  computed: {
    filteredSkills() {
      return this.skills.filter(skill =>
        skill.name.toLowerCase().includes(this.search.toLowerCase()) ||
        skill.category.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    addSkill() {
      window.location.hash = "#/provider/add-skill";
    },
    editSkill(skill) {
      alert("Edit " + skill.name);
    },
    toggleStatus(skill) {
      skill.status = skill.status === "Active" ? "Inactive" : "Active";
    },
    deleteSkill(skill) {
      if (confirm("Delete this skill?")) {
        this.skills = this.skills.filter(s => s.id !== skill.id);
      }
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Skill Provider Portal" rolePath="#/provider"></app-navbar>
    <app-sidebar role="provider" activePage="My Skills"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">My Skills</h2>
        <button class="btn btn-danger btn-sm fw-semibold" @click="addSkill">+ Add Skill</button>
      </div>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Skills..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-danger text-white">
              <tr>
                <th>ID</th>
                <th>Skill</th>
                <th>Category</th>
                <th>Credits</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="skill in filteredSkills" :key="skill.id">
                <td>{{ skill.id }}</td>
                <td>{{ skill.name }}</td>
                <td>{{ skill.category }}</td>
                <td>{{ skill.credits }}</td>
                <td>{{ skill.duration }}</td>
                <td>
                  <span class="badge"
                        :class="skill.status==='Active' ? 'bg-success' : 'bg-danger'">
                    {{ skill.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm me-2" @click="editSkill(skill)">Edit</button>
                  <button class="btn btn-warning btn-sm me-2" @click="toggleStatus(skill)">
                    {{ skill.status === "Active" ? "Deactivate" : "Activate" }}
                  </button>
                  <button class="btn btn-danger btn-sm" @click="deleteSkill(skill)">Delete</button>
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
