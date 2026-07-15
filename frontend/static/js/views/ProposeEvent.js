export default {
  data() {
    return {
      event: {
        title: "",
        date: "",
        venue: "",
        volunteersNeeded: "",
        credits: "",
        description: ""
      },
      isSubmitting: false
    };
  },
  methods: {
    submitProposal() {
      if (!this.event.title || !this.event.date || !this.event.venue) {
        alert("Please fill in the required fields (Title, Date, Venue).");
        return;
      }
      
      this.isSubmitting = true;
      
      // Simulate API call to backend
      setTimeout(() => {
        this.isSubmitting = false;
        alert("Event proposed successfully! It has been sent to the Coordinator for approval.");
        window.location.hash = "#/resident/events";
      }, 800);
    },
    resetForm() {
      this.event = { title: "", date: "", venue: "", volunteersNeeded: "", credits: "", description: "" };
    }
  },
  template: `
  <div class="bg-light min-vh-100 pb-5">

    <app-navbar title="Resident Portal" rolePath="#/resident"></app-navbar>
    <app-sidebar role="resident" activePage="Propose Event"></app-sidebar>

    <div class="container-fluid container-xl mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3 mb-md-4">
        <h2 class="fw-bold fs-3 fs-md-2 mb-0">Propose an Event</h2>
        <a href="#/resident/events" class="btn btn-outline-secondary btn-sm fw-semibold">← Back</a>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-10 col-lg-8">
          <div class="card shadow-sm border-0 rounded-4">
            <div class="card-body p-4 p-md-5">
              
              <div class="alert alert-info border-0 rounded-3 small mb-4" style="background-color: #e6f0ff; color: #004085;">
                <strong>Note:</strong> All new events must be approved by a Community Coordinator before they appear on the public calendar.
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-12">
                  <label class="form-label small fw-semibold text-muted text-uppercase">Event Title *</label>
                  <input type="text" class="form-control" placeholder="e.g., Sunday Morning Yoga" v-model="event.title">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted text-uppercase">Date & Time *</label>
                  <input type="datetime-local" class="form-control" v-model="event.date">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted text-uppercase">Venue / Location *</label>
                  <input type="text" class="form-control" placeholder="e.g., Community Hall" v-model="event.venue">
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted text-uppercase">Volunteers Needed</label>
                  <input type="number" class="form-control" placeholder="e.g., 5" v-model="event.volunteersNeeded" min="0">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-muted text-uppercase">Credit Reward (per volunteer)</label>
                  <input type="number" class="form-control" placeholder="e.g., 15" v-model="event.credits" min="0">
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-semibold text-muted text-uppercase">Description</label>
                <textarea class="form-control" rows="4" placeholder="Describe the event, what volunteers will do, etc." v-model="event.description"></textarea>
              </div>

              <div class="d-flex gap-2 pt-2 border-top">
                <button class="btn btn-light border fw-semibold flex-fill" @click="resetForm" :disabled="isSubmitting">Clear</button>
                <button class="btn btn-success fw-semibold flex-fill" @click="submitProposal" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isSubmitting ? 'Submitting...' : 'Submit Proposal' }}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
};