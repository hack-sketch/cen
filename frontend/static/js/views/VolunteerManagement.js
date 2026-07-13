export default {

    data() {
        return {

            search: "",

            volunteers: [

                {
                    id: 1,
                    event: "Tree Plantation Drive",
                    coordinator: "Rahul Shah",
                    volunteers: 18,
                    date: "20 Jul 2026",
                    status: "Open"
                },

                {
                    id: 2,
                    event: "Blood Donation Camp",
                    coordinator: "Priya Patel",
                    volunteers: 35,
                    date: "05 Aug 2026",
                    status: "Completed"
                },

                {
                    id: 3,
                    event: "Community Clean-up",
                    coordinator: "Amit Mehta",
                    volunteers: 22,
                    date: "12 Aug 2026",
                    status: "Open"
                },

                {
                    id: 4,
                    event: "Diwali Celebration",
                    coordinator: "Neha Joshi",
                    volunteers: 40,
                    date: "10 Nov 2026",
                    status: "Closed"
                }

            ]

        };

    },

    computed: {

        filteredVolunteers() {

            return this.volunteers.filter(activity =>

                activity.event.toLowerCase().includes(this.search.toLowerCase()) ||

                activity.coordinator.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        viewDetails(activity){

            alert("Viewing details for " + activity.event);

        },

        toggleStatus(activity){

            if(activity.status==="Open")
                activity.status="Closed";
            else
                activity.status="Open";

        },

        deleteActivity(activity){

            if(confirm("Delete this volunteer activity?")){

                this.volunteers = this.volunteers.filter(
                    a => a.id !== activity.id
                );

            }

        }

    },

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">

<div class="container-fluid">

<a class="navbar-brand fw-bold"
href="#/admin">

CEN Admin Panel

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

<h2>

Volunteer Management

</h2>

<a
href="#/admin"
class="btn btn-secondary">

Back

</a>

</div>


<div class="card shadow">

<div class="card-body">

<input
class="form-control mb-3"
placeholder="Search Volunteer Activities..."
v-model="search">


<table class="table table-hover table-bordered">

<thead class="table-dark">

<tr>

<th>ID</th>

<th>Activity</th>

<th>Coordinator</th>

<th>Volunteers</th>

<th>Date</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="activity in filteredVolunteers"
:key="activity.id">

<td>{{activity.id}}</td>

<td>{{activity.event}}</td>

<td>{{activity.coordinator}}</td>

<td>{{activity.volunteers}}</td>

<td>{{activity.date}}</td>

<td>

<span
class="badge"
:class="{

'bg-success':activity.status=='Open',

'bg-danger':activity.status=='Closed',

'bg-primary':activity.status=='Completed'

}">

{{activity.status}}

</span>

</td>

<td>

<button
class="btn btn-primary btn-sm me-1"
@click="viewDetails(activity)">

View

</button>

<button
class="btn btn-warning btn-sm me-1"
@click="toggleStatus(activity)"
v-if="activity.status!='Completed'">

{{activity.status=="Open" ? "Close" : "Reopen"}}

</button>

<button
class="btn btn-danger btn-sm"
@click="deleteActivity(activity)">

Delete

</button>

</td>

</tr>

</tbody>

</table>

</div>

</div>

</div>

</div>

`

}