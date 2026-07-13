export default {

    data() {
        return {

            search: "",

            events: [

                {
                    id: 101,
                    title: "Tree Plantation Drive",
                    organizer: "Green Society",
                    date: "20 Jul 2026",
                    status: "Pending"
                },

                {
                    id: 102,
                    title: "Blood Donation Camp",
                    organizer: "Health Club",
                    date: "05 Aug 2026",
                    status: "Approved"
                },

                {
                    id: 103,
                    title: "Diwali Celebration",
                    organizer: "Cultural Committee",
                    date: "10 Nov 2026",
                    status: "Pending"
                },

                {
                    id: 104,
                    title: "Yoga Workshop",
                    organizer: "Fitness Group",
                    date: "25 Jul 2026",
                    status: "Rejected"
                }

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

        approve(event) {

            event.status = "Approved";

        },

        reject(event) {

            event.status = "Rejected";

        },

        edit(event) {

            alert("Edit Event : " + event.title);

        },

        deleteEvent(event) {

            if(confirm("Delete this event?")){

                this.events = this.events.filter(
                    e => e.id !== event.id
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

Community Events

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
placeholder="Search Events..."
v-model="search">

<table class="table table-bordered table-hover">

<thead class="table-dark">

<tr>

<th>ID</th>

<th>Title</th>

<th>Organizer</th>

<th>Date</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="event in filteredEvents"
:key="event.id">

<td>{{event.id}}</td>

<td>{{event.title}}</td>

<td>{{event.organizer}}</td>

<td>{{event.date}}</td>

<td>

<span
class="badge"

:class="{

'bg-warning':event.status=='Pending',

'bg-success':event.status=='Approved',

'bg-danger':event.status=='Rejected'

}">

{{event.status}}

</span>

</td>

<td>

<button
class="btn btn-success btn-sm me-1"
@click="approve(event)">

Approve

</button>

<button
class="btn btn-danger btn-sm me-1"
@click="reject(event)">

Reject

</button>

<button
class="btn btn-primary btn-sm me-1"
@click="edit(event)">

Edit

</button>

<button
class="btn btn-secondary btn-sm"
@click="deleteEvent(event)">

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