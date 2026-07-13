export default {

    data() {

        return {

            search: "",

            skills: [

                {
                    id: 1,
                    name: "Python Programming",
                    category: "Technology",
                    credits: 25,
                    duration: "2 Hours",
                    status: "Active"
                },

                {
                    id: 2,
                    name: "Web Development",
                    category: "Technology",
                    credits: 30,
                    duration: "3 Hours",
                    status: "Active"
                },

                {
                    id: 3,
                    name: "Yoga Classes",
                    category: "Fitness",
                    credits: 15,
                    duration: "1 Hour",
                    status: "Inactive"
                },

                {
                    id: 4,
                    name: "Photography",
                    category: "Arts",
                    credits: 20,
                    duration: "2 Hours",
                    status: "Active"
                }

            ]

        };

    },

    computed: {

        filteredSkills() {

            return this.skills.filter(skill =>

                skill.name.toLowerCase().includes(this.search.toLowerCase()) ||

                skill.category.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        addSkill() {

            window.location.hash = "#/provider/add-skill";

        },

        editSkill(skill) {

            alert("Edit " + skill.name);

        },

        toggleStatus(skill) {

            skill.status =
                skill.status === "Active"
                ? "Inactive"
                : "Active";

        },

        deleteSkill(skill) {

            if(confirm("Delete this skill?")){

                this.skills = this.skills.filter(
                    s => s.id !== skill.id
                );

            }

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

My Skills

</h2>

<div>

<button
class="btn btn-success me-2"
@click="addSkill">

Add Skill

</button>

<a
href="#/provider"
class="btn btn-secondary">

Back

</a>

</div>

</div>


<div class="card shadow">

<div class="card-body">

<input
class="form-control mb-3"
placeholder="Search Skills..."
v-model="search">


<table class="table table-hover table-bordered">

<thead class="table-success">

<tr>

<th>ID</th>

<th>Skill</th>

<th>Category</th>

<th>Credits</th>

<th>Duration</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="skill in filteredSkills"
:key="skill.id">

<td>{{skill.id}}</td>

<td>{{skill.name}}</td>

<td>{{skill.category}}</td>

<td>{{skill.credits}}</td>

<td>{{skill.duration}}</td>

<td>

<span
class="badge"
:class="skill.status==='Active'
?'bg-success'
:'bg-danger'">

{{skill.status}}

</span>

</td>

<td>

<button
class="btn btn-primary btn-sm me-1"
@click="editSkill(skill)">

Edit

</button>

<button
class="btn btn-warning btn-sm me-1"
@click="toggleStatus(skill)">

{{skill.status==="Active"
? "Deactivate"
: "Activate"}}

</button>

<button
class="btn btn-danger btn-sm"
@click="deleteSkill(skill)">

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