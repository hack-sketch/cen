export default {

    data() {

        return {

            search: "",

            requests: [

                {
                    id: 1,
                    resident: "Jignesh Bhai",
                    resource: "Projector",
                    requestDate: "18 Jul 2026",
                    returnDate: "20 Jul 2026",
                    status: "Pending"
                },

                {
                    id: 2,
                    resident: "Rahul Shah",
                    resource: "Camping Tent",
                    requestDate: "15 Jul 2026",
                    returnDate: "18 Jul 2026",
                    status: "Approved"
                },

                {
                    id: 3,
                    resident: "Priya Patel",
                    resource: "Speaker System",
                    requestDate: "10 Jul 2026",
                    returnDate: "12 Jul 2026",
                    status: "Returned"
                },

                {
                    id: 4,
                    resident: "Amit Mehta",
                    resource: "Cricket Kit",
                    requestDate: "19 Jul 2026",
                    returnDate: "22 Jul 2026",
                    status: "Rejected"
                }

            ]

        };

    },

    computed: {

        filteredRequests() {

            return this.requests.filter(request =>

                request.resident.toLowerCase().includes(this.search.toLowerCase()) ||

                request.resource.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        approve(request) {

            request.status = "Approved";

        },

        reject(request) {

            request.status = "Rejected";

        },

        markReturned(request) {

            request.status = "Returned";

        }

    },

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary">

<div class="container-fluid">

<a class="navbar-brand fw-bold"
href="#/owner">

Resource Owner Portal

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

Borrow Requests

</h2>

<a
href="#/owner"
class="btn btn-secondary">

Back

</a>

</div>


<div class="card shadow">

<div class="card-body">

<input
class="form-control mb-3"
placeholder="Search Requests..."
v-model="search">


<table class="table table-hover table-bordered">

<thead class="table-primary">

<tr>

<th>ID</th>

<th>Resident</th>

<th>Resource</th>

<th>Requested</th>

<th>Return Date</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="request in filteredRequests"
:key="request.id">

<td>{{request.id}}</td>

<td>{{request.resident}}</td>

<td>{{request.resource}}</td>

<td>{{request.requestDate}}</td>

<td>{{request.returnDate}}</td>

<td>

<span
class="badge"

:class="{

'bg-warning':request.status==='Pending',

'bg-success':request.status==='Approved',

'bg-danger':request.status==='Rejected',

'bg-primary':request.status==='Returned'

}">

{{request.status}}

</span>

</td>

<td>

<button
v-if="request.status==='Pending'"
class="btn btn-success btn-sm me-1"
@click="approve(request)">

Approve

</button>

<button
v-if="request.status==='Pending'"
class="btn btn-danger btn-sm me-1"
@click="reject(request)">

Reject

</button>

<button
v-if="request.status==='Approved'"
class="btn btn-primary btn-sm"
@click="markReturned(request)">

Returned

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