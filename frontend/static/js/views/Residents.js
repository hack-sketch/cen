export default {

    data() {
        return {

            search: "",

            residents: [

                {
                    id: 1,
                    name: "Jignesh Bhai",
                    email: "jignesh@gmail.com",
                    role: "Resident",
                    credits: 120,
                    status: "Active"
                },

                {
                    id: 2,
                    name: "Rahul Shah",
                    email: "rahul@gmail.com",
                    role: "Resource Owner",
                    credits: 210,
                    status: "Active"
                },

                {
                    id: 3,
                    name: "Priya Patel",
                    email: "priya@gmail.com",
                    role: "Skill Provider",
                    credits: 180,
                    status: "Inactive"
                },

                {
                    id: 4,
                    name: "Amit Mehta",
                    email: "amit@gmail.com",
                    role: "Resident",
                    credits: 95,
                    status: "Active"
                }

            ]

        };

    },

    computed: {

        filteredResidents() {

            return this.residents.filter(resident =>

                resident.name.toLowerCase().includes(this.search.toLowerCase()) ||

                resident.email.toLowerCase().includes(this.search.toLowerCase()) ||

                resident.role.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        toggleStatus(resident) {

            resident.status =
                resident.status === "Active"
                ? "Inactive"
                : "Active";

        },

        editResident(resident) {

            alert("Edit profile of " + resident.name);

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

Residents Management

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
placeholder="Search Resident..."
v-model="search">

<table class="table table-hover table-bordered">

<thead class="table-dark">

<tr>

<th>ID</th>

<th>Name</th>

<th>Email</th>

<th>Role</th>

<th>Credits</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

<tr
v-for="resident in filteredResidents"
:key="resident.id">

<td>

{{resident.id}}

</td>

<td>

{{resident.name}}

</td>

<td>

{{resident.email}}

</td>

<td>

{{resident.role}}

</td>

<td>

{{resident.credits}}

</td>

<td>

<span
class="badge"
:class="resident.status==='Active'
? 'bg-success'
: 'bg-danger'">

{{resident.status}}

</span>

</td>

<td>

<button
class="btn btn-primary btn-sm me-2"
@click="editResident(resident)">

Edit

</button>

<button
class="btn btn-warning btn-sm"
@click="toggleStatus(resident)">

{{resident.status==='Active'
? 'Deactivate'
: 'Activate'}}

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