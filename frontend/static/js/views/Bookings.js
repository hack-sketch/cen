export default {

  data() {
    return {
      search: "",
      bookings: [
        { id: 1, student: "Jignesh Bhai", skill: "Python Programming", date: "22 Jul 2026", time: "10:00 AM", credits: 25, status: "Pending" },
        { id: 2, student: "Rahul Shah", skill: "Web Development", date: "23 Jul 2026", time: "02:00 PM", credits: 30, status: "Confirmed" },
        { id: 3, student: "Priya Patel", skill: "Yoga Classes", date: "24 Jul 2026", time: "09:00 AM", credits: 15, status: "Completed" },
        { id: 4, student: "Amit Mehta", skill: "Photography", date: "25 Jul 2026", time: "04:00 PM", credits: 20, status: "Cancelled" }
      ]
    };
  },

  computed: {
    filteredBookings() {
      return this.bookings.filter(booking =>
        booking.student.toLowerCase().includes(this.search.toLowerCase()) ||
        booking.skill.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    confirmBooking(booking) { booking.status = "Confirmed"; },
    cancelBooking(booking) { booking.status = "Cancelled"; },
    completeBooking(booking) { booking.status = "Completed"; }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <nav class="navbar navbar-dark bg-danger shadow-sm">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#providerSidebar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand fw-bold ms-2" href="#/provider">Skill Provider Portal</a>
        <button class="btn btn-outline-light btn-sm ms-auto"
                onclick="window.location.hash='#/login'">Logout</button>
      </div>
    </nav>

    <!-- Sidebar Offcanvas -->
    <div class="offcanvas offcanvas-start rounded-4 shadow-lg" tabindex="-1" id="providerSidebar" style="width:220px;">
      <div class="offcanvas-header border-bottom">
        <h5 class="offcanvas-title fw-bold text-danger">Menu</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <div class="list-group list-group-flush">
          <a href="#/provider" class="list-group-item list-group-item-action">Dashboard</a>
          <a href="#/provider/skills" class="list-group-item list-group-item-action">My Skills</a>
          <a href="#/provider/add-skill" class="list-group-item list-group-item-action">Add Skill</a>
          <a href="#/provider/bookings" class="list-group-item list-group-item-action active">Bookings</a>
          <a href="#/provider/history" class="list-group-item list-group-item-action">Teaching History</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Bookings</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Bookings..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-danger text-white">
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Skill</th>
                <th>Date</th>
                <th>Time</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in filteredBookings" :key="booking.id">
                <td>{{ booking.id }}</td>
                <td>{{ booking.student }}</td>
                <td>{{ booking.skill }}</td>
                <td>{{ booking.date }}</td>
                <td>{{ booking.time }}</td>
                <td>{{ booking.credits }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-warning': booking.status==='Pending',
                          'bg-success': booking.status==='Confirmed',
                          'bg-primary': booking.status==='Completed',
                          'bg-danger': booking.status==='Cancelled'
                        }">
                    {{ booking.status }}
                  </span>
                </td>
                <td>
                  <button v-if="booking.status==='Pending'" class="btn btn-success btn-sm me-2" @click="confirmBooking(booking)">Accept</button>
                  <button v-if="booking.status==='Pending'" class="btn btn-danger btn-sm me-2" @click="cancelBooking(booking)">Reject</button>
                  <button v-if="booking.status==='Confirmed'" class="btn btn-primary btn-sm" @click="completeBooking(booking)">Complete</button>
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
