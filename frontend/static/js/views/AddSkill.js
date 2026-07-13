export default {

    data() {

        return {

            skill: {

                name: "",
                category: "",
                description: "",
                duration: "",
                credits: "",
                level: "",
                status: "Active"

            }

        };

    },

    methods: {

        saveSkill() {

            alert("Skill added successfully!");

            window.location.hash = "#/provider/skills";

        },

        resetForm() {

            this.skill = {

                name: "",
                category: "",
                description: "",
                duration: "",
                credits: "",
                level: "",
                status: "Active"

            };

        }

    },

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-success">

<div class="container-fluid">

<a
class="navbar-brand fw-bold"
href="#/provider">

Skill Provider Portal

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

Add New Skill

</h2>

<a
href="#/provider/skills"
class="btn btn-secondary">

Back

</a>

</div>


<div class="card shadow">

<div class="card-header bg-success text-white">

Skill Information

</div>

<div class="card-body">

<div class="row">

<div class="col-md-6 mb-3">

<label class="form-label">

Skill Name

</label>

<input
type="text"
class="form-control"
v-model="skill.name"
placeholder="Enter Skill Name">

</div>


<div class="col-md-6 mb-3">

<label class="form-label">

Category

</label>

<select
class="form-select"
v-model="skill.category">

<option value="">Select Category</option>

<option>Technology</option>

<option>Fitness</option>

<option>Music</option>

<option>Arts</option>

<option>Cooking</option>

<option>Education</option>

<option>Language</option>

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
v-model="skill.description"
placeholder="Describe your skill">

</textarea>

</div>


<div class="row">

<div class="col-md-4 mb-3">

<label class="form-label">

Duration

</label>

<input
type="text"
class="form-control"
v-model="skill.duration"
placeholder="Example: 2 Hours">

</div>


<div class="col-md-4 mb-3">

<label class="form-label">

Credits Required

</label>

<input
type="number"
class="form-control"
v-model="skill.credits"
placeholder="Credits">

</div>


<div class="col-md-4 mb-3">

<label class="form-label">

Experience Level

</label>

<select
class="form-select"
v-model="skill.level">

<option value="">Select Level</option>

<option>Beginner</option>

<option>Intermediate</option>

<option>Advanced</option>

</select>

</div>

</div>


<div class="row">

<div class="col-md-6 mb-3">

<label class="form-label">

Availability

</label>

<select
class="form-select"
v-model="skill.status">

<option>Active</option>

<option>Inactive</option>

</select>

</div>


<div class="col-md-6 mb-3">

<label class="form-label">

Upload Certificate (Optional)

</label>

<input
type="file"
class="form-control">

</div>

</div>


<div class="text-end">

<button
class="btn btn-secondary me-2"
@click="resetForm">

Reset

</button>

<button
class="btn btn-success"
@click="saveSkill">

Save Skill

</button>

</div>

</div>

</div>

</div>

</div>

`

}