export default {

    data() {
        return {

            balance: 120,

            transactions: [

                {
                    date: "15 Jul 2026",
                    activity: "Tree Plantation Volunteer",
                    credits: "+20"
                },

                {
                    date: "12 Jul 2026",
                    activity: "Borrowed Projector",
                    credits: "-10"
                },

                {
                    date: "08 Jul 2026",
                    activity: "Yoga Session Conducted",
                    credits: "+25"
                },

                {
                    date: "05 Jul 2026",
                    activity: "Community Clean-up",
                    credits: "+15"
                },

                {
                    date: "02 Jul 2026",
                    activity: "Booked Guitar Lesson",
                    credits: "-20"
                }

            ]

        };

    },

    methods: {

        exportHistory() {

            alert("Transaction history exported successfully!");

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

        <h2>Community Credit Wallet</h2>

        <a href="#/resident"
           class="btn btn-secondary">

            Back

        </a>

    </div>


    <div class="card shadow mb-4">

        <div class="card-body text-center">

            <h5>Available Credits</h5>

            <h1 class="display-4 text-success">

                {{ balance }}

            </h1>

        </div>

    </div>


    <div class="card shadow">

        <div class="card-header bg-success text-white">

            Transaction History

        </div>

        <div class="card-body">

            <table class="table table-hover">

                <thead>

                    <tr>

                        <th>Date</th>
                        <th>Activity</th>
                        <th>Credits</th>

                    </tr>

                </thead>

                <tbody>

                    <tr
                        v-for="transaction in transactions"
                        :key="transaction.date">

                        <td>{{ transaction.date }}</td>

                        <td>{{ transaction.activity }}</td>

                        <td>

                            <span
                                :class="transaction.credits.startsWith('+')
                                ? 'text-success fw-bold'
                                : 'text-danger fw-bold'">

                                {{ transaction.credits }}

                            </span>

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

        <div class="card-footer text-end">

            <button
                class="btn btn-success"
                @click="exportHistory">

                Export History

            </button>

        </div>

    </div>

</div>

</div>

`

}