export default {

  data() {
    return {
      skills: [
        { id: 1, title: "Yoga Classes", provider: "Priya Patel", category: "Health & Fitness", credits: 15 },
        { id: 2, title: "Guitar Lessons", provider: "Rahul Shah", category: "Music", credits: 20 },
        { id: 3, title: "Python Programming", provider: "Amit Mehta", category: "Technology", credits: 25 },
        { id: 4, title: "Cooking Workshop", provider: "Neha Joshi", category: "Cooking", credits: 10 }
      ]
    };
  },

  methods: {
    bookSkill(skill) {
      alert("Successfully booked '" + skill.title + "' with " + skill.provider + ".");
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-success shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/resident">
          🌐 Community Exchange Network
        </a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">
          Logout
        </button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="sidebarMenu" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-success">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/resident" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/resident/events" class="list-group-item list-group-item-action">Events</a>
          <a href="#/resident/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/resident/volunteers" class="list-group-item list-group-item-action">Volunteers</a>
          <a href="#/resident/skills" class="list-group-item list-group-item-action active">Skill Exchange</a>
          <a href="#/resident/wallet" class="list-group-item list-group-item-action">Credit Wallet</a>
          <a href="#/resident/profile" class="list-group-item list-group-item-action">Profile</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Skill Exchange Marketplace</h2>

      <div class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="skill in skills" :key="skill.id">
          <div class="card shadow h-100 rounded-4">
            <div class="card-body">
              <h4 class="fw-semibold text-success mb-2">{{ skill.title }}</h4>
              <p class="mb-1"><strong>Provider:</strong> {{ skill.provider }}</p>
              <p class="mb-1"><strong>Category:</strong> {{ skill.category }}</p>
              <p class="mb-1"><strong>Required Credits:</strong> {{ skill.credits }}</p>
            </div>
            <div class="card-footer text-center bg-light rounded-bottom-4">
              <button class="btn btn-success fw-semibold" @click="bookSkill(skill)">
                Book Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
