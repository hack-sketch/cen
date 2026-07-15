export default {

  data() {
    return {
      search: "",
      newNotice: {
        title: "",
        content: "",
        category: "General"
      },
      notices: [
        { id: 1, title: "Community Pool Maintenance", content: "The community pool will be closed for maintenance on Jul 22-25. Please plan accordingly.", category: "Maintenance", date: "15 Jul 2026", author: "Admin" },
        { id: 2, title: "Upcoming Community Event", content: "Tree Plantation Drive on Jul 20. Volunteers needed! Sign up now.", category: "Events", date: "14 Jul 2026", author: "Coordinator" },
        { id: 3, title: "Important Security Update", content: "Please update your passwords as part of our quarterly security review.", category: "Security", date: "13 Jul 2026", author: "Admin" },
        { id: 4, title: "Lost Item - Golden Watch", content: "If anyone has seen a golden watch near the community center, please contact the office.", category: "Announcements", date: "12 Jul 2026", author: "Resident" }
      ]
    };
  },

  computed: {
    filteredNotices() {
      return this.notices.filter(notice =>
        notice.title.toLowerCase().includes(this.search.toLowerCase()) ||
        notice.content.toLowerCase().includes(this.search.toLowerCase())
      );
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
    postNotice() {
      if (!this.newNotice.title || !this.newNotice.content) {
        alert("Please fill in title and content.");
        return;
      }
      const notice = {
        id: Math.max(...this.notices.map(n => n.id)) + 1,
        title: this.newNotice.title,
        content: this.newNotice.content,
        category: this.newNotice.category,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        author: "You"
      };
      this.notices.unshift(notice);
      this.newNotice = { title: "", content: "", category: "General" };
      alert("Notice posted successfully!");
    },
    deleteNotice(notice) {
      if (confirm("Delete this notice?")) {
        this.notices = this.notices.filter(n => n.id !== notice.id);
      }
    }
  },

  template: `
  <div>

    <!-- Navbar -->
    <app-navbar title="Community Portal" :rolePath="rolePath"></app-navbar>
    <app-sidebar :role="currentRole" activePage="Notice Board"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">📋 Notice Board</h2>

      <!-- Post Notice Form -->
      <div class="card shadow rounded-4 mb-4">
        <div class="card-body p-4">
          <h5 class="card-title fw-bold mb-3">Post a Notice</h5>
          <div class="mb-3">
            <label class="form-label fw-semibold">Title</label>
            <input type="text" class="form-control" placeholder="Notice title" v-model="newNotice.title">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Category</label>
            <select class="form-select" v-model="newNotice.category">
              <option value="General">General</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Events">Events</option>
              <option value="Security">Security</option>
              <option value="Announcements">Announcements</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Content</label>
            <textarea class="form-control" placeholder="Write your notice here..." v-model="newNotice.content" rows="4"></textarea>
          </div>
          <button class="btn btn-success fw-semibold" @click="postNotice">Post Notice</button>
        </div>
      </div>

      <!-- Search Notices -->
      <div class="mb-3">
        <input class="form-control" placeholder="Search notices..." v-model="search">
      </div>

      <!-- Notices List -->
      <div class="row">
        <div v-for="notice in filteredNotices" :key="notice.id" class="col-md-6 mb-3">
          <div class="card shadow-sm rounded-4 h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-info">{{ notice.category }}</span>
                <small class="text-muted">{{ notice.date }}</small>
              </div>
              <h5 class="card-title fw-bold">{{ notice.title }}</h5>
              <p class="card-text">{{ notice.content }}</p>
              <small class="text-muted">By {{ notice.author }}</small>
              <div class="mt-3">
                <button class="btn btn-danger btn-sm" @click="deleteNotice(notice)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
