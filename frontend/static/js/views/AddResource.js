export default {

    data() {

        return {

            resource: {

                name: "",
                category: "",
                description: "",
                condition: "",
                status: "Available"

            }

        };

    },

    methods: {

        saveResource() {

            alert("Resource added successfully!");

            window.location.hash = "#/owner/resources";

        },

        resetForm() {

            this.resource = {

                name: "",
                category: "",
                description: "",
                condition: "",
                status: "Available"

            };

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

Add New Resource

</h2>

<a
href="#/owner/resources"
class="btn btn-secondary">

Back

</a>

</div>


<div class="card shadow">

<div class="card-header bg-primary text-white">

Resource Information

</div>

<div class="card-body">

<div class="row">

<div class="col-md-6 mb-3">

<label class="form-label">

Resource Name

</label>

<input
type="text"
class="form-control"
v-model="resource.name"
placeholder="Enter Resource Name">

</div>


<div class="col-md-6 mb-3">

<label class="form-label">

Category

</label>

<select
class="form-select"
v-model="resource.category">

<option value="">Select Category</option>

<option>Electronics</option>

<option>Sports</option>

<option>Furniture</option>

<option>Books</option>

<option>Tools</option>

<option>Outdoor</option>

<option>Kitchen</option>

<option>Others</option>

</select>

</div>

</div>


<div class="mb-3">

<label class="form-label">

Description

</label>

<textarea
rows="4"
class="form-control"
v-model="resource.description"
placeholder="Enter Description">

</textarea>

</div>


<div class="row">

<div class="col-md-6 mb-3">

<label class="form-label">

Condition

</label>

<select
class="form-select"
v-model="resource.condition">

<option value="">Select Condition</option>

<option>Excellent</option>

<option>Very Good</option>

<option>Good</option>

<option>Fair</option>

</select>

</div>


<div class="col-md-6 mb-3">

<label class="form-label">

Availability

</label>

<select
class="form-select"
v-model="resource.status">

<option>Available</option>

<option>Maintenance</option>

</select>

</div>

</div>


<div class="mb-4">

<label class="form-label">

Upload Resource Image

</label>

<input
type="file"
class="form-control">

</div>


<div class="text-end">

<button
class="btn btn-secondary me-2"
@click="resetForm">

Reset

</button>

<button
class="btn btn-success"
@click="saveResource">

Save Resource

</button>

</div>

</div>

</div>

</div>

</div>

`

}
