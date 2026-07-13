export default {

    data() {

        return {

            search: "",

            history: [

                {
                    id: 1,
                    resident: "Rahul Shah",
                    resource: "Projector",
                    borrowedOn: "01 Jul 2026",
                    returnedOn: "03 Jul 2026",
                    duration: "2 Days",
                    status: "Completed"
                },

                {
                    id: 2,
                    resident: "Priya Patel",
                    resource: "Camping Tent",
                    borrowedOn: "05 Jul 2026",
                    returnedOn: "08 Jul 2026",
                    duration: "3 Days",
                    status: "Completed"
                },

                {
                    id: 3,
                    resident: "Amit Mehta",
                    resource: "Speaker System",
                    borrowedOn: "10 Jul 2026",
                    returnedOn: "12 Jul 2026",
                    duration: "2 Days",
                    status: "Completed"
                },

                {
                    id: 4,
                    resident: "Neha Joshi",
                    resource: "Cricket Kit",
                    borrowedOn: "15 Jul 2026",
                    returnedOn: "18 Jul 2026",
                    duration: "3 Days",
                    status: "Completed"
                }

            ]

        };

    },

    computed: {

        filteredHistory() {

            return this.history.filter(item =>

                item.resident.toLowerCase().includes(this.search.toLowerCase()) ||

                item.resource.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        exportHistory() {

            alert("Borrow history exported successfully!");

        }

    },

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary">

<div class="container-fluid">

<a
class="navbar-brand fw-bold"
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

Borrow History

</h2>

<div>

<button
class="btn btn-success me-2"
@click="exportHistory">

Export History

</button>

<a
href="#/owner"
class="btn btn-secondary">

Back

</a>

</div>

</div>


<div class="card shadow">

<div class="card-body">

<input
class="form-control mb-3"
placeholder="Search Borrow History..."
v-model="search">


<table class="table table-bordered table-hover">

<thead class="table-primary">

<tr>

<th>ID</th>

<th>Resident</th>

<th>Resource</th>

<th>Borrowed On</th>

<th>Returned On</th>

<th>Duration</th>

<th>Status</th>

</tr>

</thead>

<tbody>

<tr
v-for="item in filteredHistory"
:key="item.id">

<td>{{item.id}}</td>

<td>{{item.resident}}</td>

<td>{{item.resource}}</td>

<td>{{item.borrowedOn}}</td>

<td>{{item.returnedOn}}</td>

<td>{{item.duration}}</td>

<td>

<span class="badge bg-success">

{{item.status}}

</span>

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