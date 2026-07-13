export default {

  data() {
    return {
      reports: [
        { id: 1, title: "Monthly Community Activity Report", period: "July 2026", generatedOn: "01 Aug 2026", status: "Generated" },
        { id: 2, title: "Volunteer Participation Report", period: "July 2026", generatedOn: "01 Aug 2026", status: "Generated" },
        { id: 3, title: "Resource Sharing Report", period: "July 2026", generatedOn: "01 Aug 2026", status: "Generated" },
        { id: 4, title: "Community Credit Report", period: "July 2026", generatedOn: "01 Aug 2026", status: "Pending" }
      ]
    };
  },

  methods: {
    viewReport(report) {
      alert("Opening " + report.title);
    },
    downloadPDF(report) {
      alert("Downloading PDF for " + report.title);
    },
    downloadCSV(report) {
      alert("Downloading CSV for " + report.title);
    },
    generateReport() {
      alert("Monthly Report Generated Successfully!");
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
          <a href="#/admin/skills" class="list-group-item list-group-item-action">Skills</a>
          <a href="#/admin/volunteers" class="list-group-item list-group-item-action">Volunteer Activities</a>
          <a href="#/admin/analytics" class="list-group-item list-group-item-action">Analytics</a>
          <a href="#/admin/reports" class="list-group-item list-group-item-action active">Reports</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action">Settings</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">Reports</h2>
        <button class="btn btn-success btn-sm fw-semibold" @click="generateReport">+ Generate Report</button>
      </div>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Report</th>
                <th>Period</th>
                <th>Generated On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id">
                <td>{{ report.id }}</td>
                <td>{{ report.title }}</td>
                <td>{{ report.period }}</td>
                <td>{{ report.generatedOn }}</td>
                <td>
                  <span class="badge"
                        :class="report.status==='Generated' ? 'bg-success' : 'bg-warning'">
                    {{ report.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm me-2" @click="viewReport(report)">View</button>
                  <button class="btn btn-danger btn-sm me-2" @click="downloadPDF(report)">PDF</button>
                  <button class="btn btn-success btn-sm" @click="downloadCSV(report)">CSV</button>
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
