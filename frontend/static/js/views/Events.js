export default {

    data() {
        return {

            events: [

                {
                    id: 1,
                    title: "Tree Plantation Drive",
                    date: "20 July 2026",
                    venue: "Community Garden",
                    credits: 20
                },

                {
                    id: 2,
                    title: "Yoga Workshop",
                    date: "25 July 2026",
                    venue: "Community Hall",
                    credits: 15
                },

                {
                    id: 3,
                    title: "Diwali Celebration",
                    date: "10 November 2026",
                    venue: "Society Ground",
                    credits: 30
                }

            ]

        };
    },

    methods: {

        viewEvent(id) {

            localStorage.setItem("eventId", id);

            window.location.hash = "#/resident/event";

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


<div class="container mt-4">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <h2>Community Events</h2>

        <a href="#/resident"
           class="btn btn-secondary">
            Back
        </a>

    </div>


    <div class="row">

        <div class="col-md-4 mb-4"
             v-for="event in events"
             :key="event.id">

            <div class="card shadow h-100">

                <div class="card-body">

                    <h4 class="card-title">
                        {{ event.title }}
                    </h4>

                    <p>
                        <strong>Date :</strong>
                        {{ event.date }}
                    </p>

                    <p>
                        <strong>Venue :</strong>
                        {{ event.venue }}
                    </p>

                    <p>
                        <strong>Reward :</strong>
                        {{ event.credits }} Credits
                    </p>

                </div>

                <div class="card-footer text-center">

                    <button
                        class="btn btn-success"
                        @click="viewEvent(event.id)">

                        View Details

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

</div>

`

}