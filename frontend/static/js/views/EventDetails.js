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

        this.event = this.events.find(
            event => event.id === eventId
        );

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

<nav class="navbar navbar-expand-lg navbar-dark bg-success">

    <div class="container-fluid">

        <a class="navbar-brand fw-bold"
           href="#/resident">

           Community Exchange Network

        </a>

        <button class="btn btn-outline-light"
                onclick="window.location.hash='#/login'">

            Logout

        </button>

    </div>

</nav>


<div class="container mt-4" v-if="event">

    <div class="card shadow">

        <div class="card-header bg-success text-white">

            <h3>{{ event.title }}</h3>

        </div>

        <div class="card-body">

            <p>
                <strong>Date:</strong>
                {{ event.date }}
            </p>

            <p>
                <strong>Venue:</strong>
                {{ event.venue }}
            </p>

            <p>
                <strong>Community Credits:</strong>
                {{ event.credits }}
            </p>

            <p>
                <strong>Volunteers Needed:</strong>
                {{ event.volunteersNeeded }}
            </p>

            <p>
                <strong>Description:</strong>
            </p>

            <p>
                {{ event.description }}
            </p>

        </div>

        <div class="card-footer">

            <button
                class="btn btn-success me-2"
                @click="rsvp">

                RSVP

            </button>

            <button
                class="btn btn-warning me-2"
                @click="volunteer">

                Volunteer

            </button>

            <a href="#/resident/events"
               class="btn btn-secondary">

                Back

            </a>

        </div>

    </div>

</div>

</div>

`

}