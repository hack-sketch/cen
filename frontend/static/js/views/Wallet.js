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
    <app-navbar title="Resident Portal" rolePath="#/resident"></app-navbar>
    <app-sidebar role="resident" activePage="Wallet"></app-sidebar>

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
