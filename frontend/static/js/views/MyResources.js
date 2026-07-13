export default {

    data() {
        return {

            search: "",

            resources: [

                {
                    id: 1,
                    name: "Projector",
                    category: "Electronics",
                    condition: "Excellent",
                    status: "Available"
                },

                {
                    id: 2,
                    name: "Camping Tent",
                    category: "Outdoor",
                    condition: "Good",
                    status: "Borrowed"
                },

                {
                    id: 3,
                    name: "Speaker System",
                    category: "Audio",
                    condition: "Very Good",
                    status: "Available"
                },

                {
                    id: 4,
                    name: "Cricket Kit",
                    category: "Sports",
                    condition: "Good",
                    status: "Maintenance"
                }

            ]

        };

    },

    computed: {

        filteredResources() {

            return this.resources.filter(resource =>

                resource.name.toLowerCase().includes(this.search.toLowerCase()) ||

                resource.category.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        addResource() {

            window.location.hash = "#/owner/add-resource";

        },

        editResource(resource) {

            alert("Edit " + resource.name);

        },

        deleteResource(resource) {

            if (confirm("Delete this resource?")) {

                this.resources = this.resources.filter(
                    r => r.id !== resource.id
                );

            }

        },

        changeStatus(resource) {

            if (resource.status === "Available") {

                resource.status = "Maintenance";

            }

            else if (resource.status === "Maintenance") {

                resource.status = "Borrowed";

            }

            else {

                resource.status = "Available";

            }

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

My Resources

</h2>

<div>

<button
class="btn btn-success me-2"
@click="addResource">

Add Resource

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
placeholder="Search Resource..."
v-model="search">


<table class="table table-hover table-bordered">

<thead class="table-primary">

<tr>

<th>ID</th>

<th>Resource</th>

<th>Category</th>

<th>Condition</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="resource in filteredResources"
:key="resource.id">

<td>{{resource.id}}</td>

<td>{{resource.name}}</td>

<td>{{resource.category}}</td>

<td>{{resource.condition}}</td>

<td>

<span
class="badge"

:class="{

'bg-success':resource.status==='Available',

'bg-warning':resource.status==='Maintenance',

'bg-danger':resource.status==='Borrowed'

}">

{{resource.status}}

</span>

</td>

<td>

<button
class="btn btn-primary btn-sm me-1"
@click="editResource(resource)">

Edit

</button>

<button
class="btn btn-warning btn-sm me-1"
@click="changeStatus(resource)">

Status

</button>

<button
class="btn btn-danger btn-sm"
@click="deleteResource(resource)">

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