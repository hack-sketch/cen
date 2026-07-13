export default {

  data() {
    return {
      search: "",
      events: [
        { id: 1, title: "Tree Plantation Drive", organizer: "Green Club", date: "20 Jul 2026", location: "Community Park", status: "Pending" },
        { id: 2, title: "Blood Donation Camp", organizer: "Red Cross", date: "25 Jul 2026", location: "Community Hall", status: "Approved" },
        { id: 3, title: "Cleanliness Drive", organizer: "Youth Group", date: "30 Jul 2026", location: "Main Street", status: "Rejected" },
        { id: 4, title: "Independence Day Celebration", organizer: "Residents Association", date: "15 Aug 2026", location: "Club House", status: "Approved" }
      ]
    };
  },

  computed: {
    filteredEvents() {
      return this.events.filter(event =>
        event.title.toLowerCase().includes(this.search.toLowerCase()) ||
        event.organizer.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },

  methods: {
    approve(event) { event.status = "Approved"; },
    reject(event) { event.status = "Rejected"; },
    editEvent(event) { alert("Edit Event : " + event.title); },
    deleteEvent(event) {
      if (confirm("Delete this event?")) {
        this.events = this.events.filter(e => e.id !== event.id);
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
          <a href="#/admin/events" class="list-group-item list-group-item-action active">Events</a>
          <a href="#/admin/resources" class="list-group-item list-group-item-action">Resources</a>
          <a href="#/admin/skills" class="list-group-item list-group-item-action">Skills</a>
          <a href="#/admin/volunteers" class="list-group-item list-group-item-action">Volunteer Activities</a>
          <a href="#/admin/analytics" class="list-group-item list-group-item-action">Analytics</a>
          <a href="#/admin/reports" class="list-group-item list-group-item-action">Reports</a>
          <a href="#/admin/settings" class="list-group-item list-group-item-action">Settings</a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Community Events</h2>

      <div class="card shadow rounded-4">
        <div class="card-body p-3">
          <input class="form-control mb-3" placeholder="Search Events..." v-model="search">

          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark text-white">
              <tr>
                <th>ID</th>
                <th>Event</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in filteredEvents" :key="event.id">
                <td>{{ event.id }}</td>
                <td>{{ event.title }}</td>
                <td>{{ event.organizer }}</td>
                <td>{{ event.date }}</td>
                <td>{{ event.location }}</td>
                <td>
                  <span class="badge"
                        :class="{
                          'bg-warning': event.status==='Pending',
                          'bg-success': event.status==='Approved',
                          'bg-danger': event.status==='Rejected'
                        }">
                    {{ event.status }}
                  </span>
                </td>
                <td>
                  <button v-if="event.status==='Pending'" class="btn btn-success btn-sm me-2" @click="approve(event)">Approve</button>
                  <button v-if="event.status==='Pending'" class="btn btn-danger btn-sm me-2" @click="reject(event)">Reject</button>
                  <button class="btn btn-primary btn-sm me-2" @click="editEvent(event)">Edit</button>
                  <button class="btn btn-danger btn-sm" @click="deleteEvent(event)">Delete</button>
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
