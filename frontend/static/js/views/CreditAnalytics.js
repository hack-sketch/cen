export default {

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">

<div class="container-fluid">

<a class="navbar-brand fw-bold" href="#/admin">
CEN Admin Panel
</a>

<button class="btn btn-outline-light"
onclick="window.location.hash='#/login'">

Logout

</button>

</div>

</nav>


<div class="container mt-4">

<div class="d-flex justify-content-between align-items-center mb-4">

<h2>Community Analytics</h2>

<a href="#/admin"
class="btn btn-secondary">

Back

</a>

</div>


<div class="row">

<div class="col-md-3">

<div class="card border-primary shadow">

<div class="card-body text-center">

<h2>245</h2>

<p>Total Residents</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card border-success shadow">

<div class="card-body text-center">

<h2>18</h2>

<p>Total Events</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card border-warning shadow">

<div class="card-body text-center">

<h2>96</h2>

<p>Resources Shared</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card border-danger shadow">

<div class="card-body text-center">

<h2>5420</h2>

<p>Total Credits</p>

</div>

</div>

</div>

</div>


<div class="row mt-5">

<div class="col-lg-6 mb-4">

<div class="card shadow">

<div class="card-header bg-success text-white">

Monthly Events

</div>

<div class="card-body">

<canvas id="eventChart"></canvas>

</div>

</div>

</div>


<div class="col-lg-6 mb-4">

<div class="card shadow">

<div class="card-header bg-primary text-white">

Credit Distribution

</div>

<div class="card-body">

<canvas id="creditChart"></canvas>

</div>

</div>

</div>

</div>

</div>

</div>

`,

    mounted() {

        new Chart(
            document.getElementById("eventChart"),
            {
                type: "bar",

                data: {

                    labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun"
                    ],

                    datasets: [{

                        label: "Events",

                        data: [
                            4,
                            6,
                            5,
                            8,
                            10,
                            7
                        ]

                    }]

                }

            }

        );


        new Chart(
            document.getElementById("creditChart"),
            {

                type: "pie",

                data: {

                    labels: [

                        "Residents",
                        "Skill Providers",
                        "Resource Owners"

                    ],

                    datasets: [{

                        data: [

                            2500,
                            1700,
                            1220

                        ]

                    }]

                }

            }

        );

    }

}