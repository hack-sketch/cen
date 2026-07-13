export default {

    data() {
        return {

            search: "",

            skills: [

                {
                    id: 1,
                    skill: "Yoga Classes",
                    provider: "Priya Patel",
                    category: "Fitness",
                    credits: 15,
                    status: "Active"
                },

                {
                    id: 2,
                    skill: "Python Programming",
                    provider: "Amit Mehta",
                    category: "Technology",
                    credits: 25,
                    status: "Active"
                },

                {
                    id: 3,
                    skill: "Guitar Lessons",
                    provider: "Rahul Shah",
                    category: "Music",
                    credits: 20,
                    status: "Inactive"
                },

                {
                    id: 4,
                    skill: "Cooking Workshop",
                    provider: "Neha Joshi",
                    category: "Cooking",
                    credits: 10,
                    status: "Active"
                }

            ]

        };

    },

    computed: {

        filteredSkills() {

            return this.skills.filter(skill =>

                skill.skill.toLowerCase().includes(this.search.toLowerCase()) ||

                skill.provider.toLowerCase().includes(this.search.toLowerCase()) ||

                skill.category.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        editSkill(skill){

            alert("Edit Skill : " + skill.skill);

        },

        toggleStatus(skill){

            skill.status =
                skill.status === "Active"
                ? "Inactive"
                : "Active";

        },

        deleteSkill(skill){

            if(confirm("Delete this skill?")){

                this.skills = this.skills.filter(
                    s => s.id !== skill.id
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

Community Skills

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
placeholder="Search Skills..."
v-model="search">


<table class="table table-bordered table-hover">

<thead class="table-dark">

<tr>

<th>ID</th>

<th>Skill</th>

<th>Provider</th>

<th>Category</th>

<th>Credits</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="skill in filteredSkills"
:key="skill.id">

<td>{{skill.id}}</td>

<td>{{skill.skill}}</td>

<td>{{skill.provider}}</td>

<td>{{skill.category}}</td>

<td>{{skill.credits}}</td>

<td>

<span
class="badge"
:class="skill.status=='Active'
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

{{skill.status=='Active'
?'Deactivate'
:'Activate'}}

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