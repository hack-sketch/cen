export default {

  data() {
    return {
      stats: {
        totalSkills: 6,
        activeSkills: 5,
        totalBookings: 42,
        upcomingSessions: 8,
        completedSessions: 34
      },
      upcomingBookings: [
        { student: "Rahul Shah", skill: "Python Programming", date: "21 Jul 2026", time: "10:00 AM", status: "Confirmed" },
        { student: "Priya Patel", skill: "Python Programming", date: "22 Jul 2026", time: "02:00 PM", status: "Pending" },
        { student: "Amit Mehta", skill: "Web Development", date: "23 Jul 2026", time: "11:30 AM", status: "Confirmed" }
      ]
    };
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Skill Provider Portal" rolePath="#/provider"></app-navbar>
    <app-sidebar role="provider" activePage="Dashboard"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Skill Provider Dashboard</h2>

      <!-- Stats Cards -->
      <div class="row g-4">
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-danger">
            <div class="card-body text-center">
              <h2>{{ stats.totalSkills }}</h2>
              <p>Total Skills</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-success">
            <div class="card-body text-center">
              <h2>{{ stats.activeSkills }}</h2>
              <p>Active Skills</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-warning">
            <div class="card-body text-center">
              <h2>{{ stats.totalBookings }}</h2>
              <p>Total Bookings</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card shadow h-100 rounded-4 border-primary">
            <div class="card-body text-center">
              <h2>{{ stats.upcomingSessions }}</h2>
              <p>Upcoming Sessions</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Bookings -->
      <div class="card shadow h-100 rounded-4 mt-5">
        <div class="card-header bg-danger text-white fw-semibold rounded-top-4">
          Upcoming Bookings
        </div>
        <div class="card-body p-3">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Student</th>
                <th>Skill</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in upcomingBookings" :key="booking.student + booking.date">
                <td>{{ booking.student }}</td>
                <td>{{ booking.skill }}</td>
                <td>{{ booking.date }}</td>
                <td>{{ booking.time }}</td>
                <td>
                  <span class="badge"
                        :class="booking.status==='Confirmed' ? 'bg-success' : 'bg-warning'">
                    {{ booking.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="row mt-4 g-3">
        <div class="col-md-4">
          <a href="#/provider/skills" class="btn btn-success w-100 fw-semibold">Manage Skills</a>
        </div>
        <div class="col-md-4">
          <a href="#/provider/add-skill" class="btn btn-danger w-100 fw-semibold">Add New Skill</a>
        </div>
        <div class="col-md-4">
          <a href="#/provider/bookings" class="btn btn-warning w-100 fw-semibold">View Bookings</a>
        </div>
      </div>
    </div>

  </div>
  `
};
