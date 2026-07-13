export default {

    data() {
        return {

            opportunities: [

                {
                    id: 1,
                    title: "Tree Plantation Drive",
                    date: "20 July 2026",
                    credits: 20,
                    slots: 8
                },

                {
                    id: 2,
                    title: "Community Clean-up",
                    date: "28 July 2026",
                    credits: 15,
                    slots: 12
                },

                {
                    id: 3,
                    title: "Diwali Celebration",
                    date: "10 November 2026",
                    credits: 30,
                    slots: 25
                }

            ]

        };

    },

    methods: {

        apply(opportunity) {

            alert(
                "You have successfully applied for '" +
                opportunity.title +
                "' as a volunteer."
            );

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

        <button
            class="btn btn-outline-light"
            onclick="window.location.hash='#/login'">

            Logout

        </button>

    </div>

</nav>


<div class="container mt-4">

    <div class="d-flex justify-content-between align-items-center mb-4">

        <h2>Volunteer Opportunities</h2>

        <a href="#/resident"
           class="btn btn-secondary">

            Back

        </a>

    </div>

    <div class="row">

        <div
            class="col-md-4 mb-4"
            v-for="opportunity in opportunities"
            :key="opportunity.id">

            <div class="card shadow h-100">

                <div class="card-body">

                    <h4>{{ opportunity.title }}</h4>

                    <p>

                        <strong>Date:</strong>

                        {{ opportunity.date }}

                    </p>

                    <p>

                        <strong>Reward:</strong>

                        {{ opportunity.credits }} Credits

                    </p>

                    <p>

                        <strong>Available Slots:</strong>

                        {{ opportunity.slots }}

                    </p>

                </div>

                <div class="card-footer text-center">

                    <button
                        class="btn btn-success"
                        @click="apply(opportunity)">

                        Apply

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

</div>

`

}