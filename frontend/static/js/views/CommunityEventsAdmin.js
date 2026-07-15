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
    reject(event) { event.status = "Rejected"; }
  },
  template: `
  <div class="bg-light min-vh-100 pb-5">

    <app-navbar title="Coordinator Panel" rolePath="#/coord"></app-navbar>
    <app-sidebar role="coordinator" activePage="Events"></app-sidebar>

    <div class="container-fluid container-xl mt-4">
      <h2 class="fw-bold mb-3 mb-md-4 fs-3 fs-md-2">Event Approvals</h2>

      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-3 p-md-4">
          
          <div class="row mb-3">
            <div class="col-12 col-md-6 col-lg-4">
              <input class="form-control" placeholder="Search Events..." v-model="search">
            </div>
          </div>

          <div class="table-responsive rounded-3 border">
            <table class="table table-hover align-middle mb-0" style="min-width: 800px;">
              <thead class="table-dark text-white">
                <tr>
                  <th class="ps-3">ID</th>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th class="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr v-for="event in filteredEvents" :key="event.id">
                  <td class="ps-3 fw-medium">{{ event.id }}</td>
                  <td>{{ event.title }}</td>
                  <td>{{ event.organizer }}</td>
                  <td>{{ event.date }}</td>
                  <td>{{ event.location }}</td>
                  <td>
                    <span class="badge"
                          :class="{
                            'bg-warning text-dark': event.status==='Pending',
                            'bg-success': event.status==='Approved',
                            'bg-danger': event.status==='Rejected'
                          }">
                      {{ event.status }}
                    </span>
                  </td>
                  <td class="text-end pe-3">
                    <div class="d-flex justify-content-end gap-2 flex-nowrap">
                      <button v-if="event.status === 'Pending'" class="btn btn-success btn-sm fw-semibold" @click="approve(event)">Approve</button>
                      <button v-if="event.status === 'Pending'" class="btn btn-danger btn-sm fw-semibold" @click="reject(event)">Reject</button>
                      <span v-if="event.status !== 'Pending'" class="text-muted small px-2">Processed</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  </div>
  `
};