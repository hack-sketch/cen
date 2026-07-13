export default {

  data() {
    return {
      search: "",
      skills: [
        { id: 1, skill: "Yoga Classes", provider: "Priya Patel", category: "Fitness", credits: 15, status: "Active" },
        { id: 2, skill: "Python Programming", provider: "Amit Mehta", category: "Technology", credits: 25, status: "Active" },
        { id: 3, skill: "Guitar Lessons", provider: "Rahul Shah", category: "Music", credits: 20, status: "Inactive" },
        { id: 4, skill: "Cooking Workshop", provider: "Neha Joshi", category: "Cooking", credits: 10, status: "Active" }
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
    editSkill(skill) {
      alert("Edit Skill : " + skill.skill);
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
    <nav class="navbar navbar-dark bg-dark shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/admin">CEN Admin Panel</a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">Logout</button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="adminSidebar" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-dark">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/admin" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/admin/residents" class="list-group-item list-group-item-action">Residents</a>
          <a href="#/admin/events" class="list-group-item list-group-item-action">Events</a>
          <a href="#/admin/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/admin/skills" class="list-group-item list-group-item-action active">Skills</a>
          <a href="#/admin/volunteers" class="list-group-item list-group-item-action">Volunteer Activities</a>
          <a href="#/admin/analytics" class="list-group-item list-group-item-action">Analytics</a>
          <a href="#/admin/reports" class="list-group-item list-group-item-action">Reports</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action">Settings</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Skills</h2>

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
                        :class="skill.status==='Active' ? 'bg-success' : 'bg-danger'">
                    {{ skill.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm me-2" @click="editSkill(skill)">Edit</button>
                  <button class="btn btn-warning btn-sm me-2" @click="toggleStatus(skill)">
                    {{ skill.status==='Active' ? 'Deactivate' : 'Activate' }}
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
