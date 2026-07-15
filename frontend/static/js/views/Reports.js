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
    <app-navbar title="CEN Admin Panel" rolePath="#/admin"></app-navbar>
    <app-sidebar role="admin" activePage="Reports"></app-sidebar>

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
