export default {

  data() {
    return {
      balance: 120,
      transactions: [
        { date: "15 Jul 2026", activity: "Tree Plantation Volunteer", credits: "+20" },
        { date: "12 Jul 2026", activity: "Borrowed Projector", credits: "-10" },
        { date: "08 Jul 2026", activity: "Yoga Session Conducted", credits: "+25" },
        { date: "05 Jul 2026", activity: "Community Clean-up", credits: "+15" },
        { date: "02 Jul 2026", activity: "Booked Guitar Lesson", credits: "-20" }
      ]
    };
  },

  methods: {
    exportHistory() {
      alert("Transaction history exported successfully!");
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
          <a href="#/resident/skills" class="list-group-item list-group-item-action">Skill Exchange</a>
          <a href="#/resident/wallet" class="list-group-item list-group-item-action active">Credit Wallet</a>
          <a href="#/resident/profile" class="list-group-item list-group-item-action">Profile</a>
        </div>
      </div>
    </div>

    <!-- Wallet Section -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Credit Wallet</h2>

      <!-- Balance Card -->
      <div class="card shadow h-100 rounded-4 mb-4 text-center">
        <div class="card-body">
          <h6 class="text-muted">Available Credits</h6>
          <h1 class="display-4 text-success fw-bold">{{ balance }}</h1>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="card shadow h-100 rounded-4">
        <div class="card-header bg-success text-white fw-semibold rounded-top-4">
          Transaction History
        </div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th class="text-end">Credits</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction.date">
                <td>{{ transaction.date }}</td>
                <td>{{ transaction.activity }}</td>
                <td class="text-end">
                  <span :class="transaction.credits.startsWith('+') ? 'text-success fw-bold' : 'text-danger fw-bold'">
                    {{ transaction.credits }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-footer text-end bg-light rounded-bottom-4">
          <button class="btn btn-success btn-sm fw-semibold" @click="exportHistory">
            ⬇ Export History
          </button>
        </div>
      </div>
    </div>

  </div>
  `
};
