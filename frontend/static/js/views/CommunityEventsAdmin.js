const CommunityEventsAdmin = {
    template: `
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Event Management (Admin Panel)</h2>
                <button class="btn btn-primary" @click="openModal">
                    <i class="bi bi-plus-circle"></i> Create New Event
                </button>
            </div>

            <p class="text-muted">Review, update, approve, or cancel events happening in the community ecosystem.</p>

            <div class="card shadow-sm mt-3">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Event Title</th>
                                    <th>Date & Time</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="event in events" :key="event.id">
                                    <td>
                                        <div class="fw-bold">{{ event.title }}</div>
                                    </td>
                                    <td>{{ event.date }}</td>
                                    <td>{{ event.location }}</td>
                                    <td>
                                        <span :class="['badge', event.status === 'Approved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning']">
                                            {{ event.status }}
                                        </span>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-secondary me-2" @click="editEvent(event)">Edit</button>
                                        <button class="btn btn-sm btn-outline-danger" @click="deleteEvent(event.id)">Cancel</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            events: [
                { id: 1, title: "Annual Summer Block Party", date: "July 25, 2026 at 4:00 PM", location: "Main Courtyard", status: "Approved" },
                { id: 2, title: "Town Hall & Budget Review", date: "August 02, 2026 at 7:00 PM", location: "Community Hall B", status: "Approved" },
                { id: 3, title: "Youth Soccer Tournament Registration", date: "August 10, 2026 at 9:00 AM", location: "Sports Complex", status: "Pending Approval" }
            ]
        };
    },
    methods: {
        openModal() {
            alert("Create Event Modal opened! (Frontend Simulation)");
        },
        editEvent(event) {
            alert(`Editing details for: "${event.title}"`);
        },
        deleteEvent(id) {
            if (confirm("Are you sure you want to cancel this event?")) {
                this.events = this.events.filter(e => e.id !== id);
            }
        }
    }
};

export default CommunityEventsAdmin;