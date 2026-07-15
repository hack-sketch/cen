export default {

  data() {
    return {
      event: null,
      events: [
        {
          id: 1,
          title: "Tree Plantation Drive",
          date: "20 July 2026",
          venue: "Community Garden",
          credits: 20,
          description: "Join fellow residents in planting trees to improve the community environment.",
          volunteersNeeded: 15
        },
        {
          id: 2,
          title: "Yoga Workshop",
          date: "25 July 2026",
          venue: "Community Hall",
          credits: 15,
          description: "Learn yoga techniques from experienced instructors within the community.",
          volunteersNeeded: 5
        },
        {
          id: 3,
          title: "Diwali Celebration",
          date: "10 November 2026",
          venue: "Society Ground",
          credits: 30,
          description: "Celebrate Diwali with cultural programs, food stalls and community activities.",
          volunteersNeeded: 20
        }
      ]
    };
  },

  created() {
    const eventId = parseInt(localStorage.getItem("eventId"));
    this.event = this.events.find(event => event.id === eventId);
  },

  methods: {
    rsvp() {
      alert("Successfully registered for the event!");
    },
    volunteer() {
      alert("Volunteer request submitted!");
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Resident Portal" rolePath="#/resident"></app-navbar>
    <app-sidebar role="resident" activePage="Events"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4" v-if="event">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow h-100 rounded-4">
            <div class="card-header bg-success text-white fw-semibold rounded-top-4">
              <h3>{{ event.title }}</h3>
            </div>
            <div class="card-body">
              <p><strong>📅 Date:</strong> {{ event.date }}</p>
              <p><strong>📍 Venue:</strong> {{ event.venue }}</p>
              <p><strong>💰 Community Credits:</strong> {{ event.credits }}</p>
              <p><strong>👥 Volunteers Needed:</strong> {{ event.volunteersNeeded }}</p>
              <p><strong>Description:</strong></p>
              <p>{{ event.description }}</p>
            </div>
            <div class="card-footer text-center bg-light rounded-bottom-4">
              <button class="btn btn-success me-2 fw-semibold" @click="rsvp">RSVP</button>
              <button class="btn btn-warning me-2 fw-semibold" @click="volunteer">Volunteer</button>
              <a href="#/resident/events" class="btn btn-secondary">Back</a>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};
