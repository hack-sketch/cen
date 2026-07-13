export default {

    data() {
        return {

            search: "",

            resources: [

                {
                    id: 1,
                    name: "Projector",
                    owner: "Rahul Shah",
                    category: "Electronics",
                    status: "Available"
                },

                {
                    id: 2,
                    name: "Camping Tent",
                    owner: "Priya Patel",
                    category: "Outdoor",
                    status: "Borrowed"
                },

                {
                    id: 3,
                    name: "Speaker System",
                    owner: "Amit Mehta",
                    category: "Audio",
                    status: "Available"
                },

                {
                    id: 4,
                    name: "Cricket Kit",
                    owner: "Karan Joshi",
                    category: "Sports",
                    status: "Maintenance"
                }

            ]

        };

    },

    computed: {

        filteredResources() {

            return this.resources.filter(resource =>

                resource.name.toLowerCase().includes(this.search.toLowerCase()) ||

                resource.owner.toLowerCase().includes(this.search.toLowerCase()) ||

                resource.category.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        editResource(resource) {

            alert("Edit Resource : " + resource.name);

        },

        removeResource(resource) {

            if(confirm("Remove this resource?")){

                this.resources = this.resources.filter(
                    r => r.id !== resource.id
                );

            }

        },

        changeStatus(resource){

            if(resource.status==="Available")
                resource.status="Maintenance";

            else if(resource.status==="Maintenance")
                resource.status="Borrowed";

            else
                resource.status="Available";

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

Community Resources

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
placeholder="Search Resources..."
v-model="search">

<table class="table table-bordered table-hover">

<thead class="table-dark">

<tr>

<th>ID</th>

<th>Resource</th>

<th>Owner</th>

<th>Category</th>

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

<td>{{resource.owner}}</td>

<td>{{resource.category}}</td>

<td>

<span
class="badge"

:class="{

'bg-success':resource.status=='Available',

'bg-warning':resource.status=='Maintenance',

'bg-danger':resource.status=='Borrowed'

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

Change Status

</button>

<button
class="btn btn-danger btn-sm"
@click="removeResource(resource)">

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