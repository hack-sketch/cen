export default {

    data() {

        return {

            search: "",

            history: [

                {
                    id: 1,
                    student: "Rahul Shah",
                    skill: "Python Programming",
                    date: "02 Jul 2026",
                    duration: "2 Hours",
                    credits: 25,
                    rating: 5
                },

                {
                    id: 2,
                    student: "Priya Patel",
                    skill: "Web Development",
                    date: "05 Jul 2026",
                    duration: "3 Hours",
                    credits: 30,
                    rating: 4
                },

                {
                    id: 3,
                    student: "Amit Mehta",
                    skill: "Photography",
                    date: "10 Jul 2026",
                    duration: "2 Hours",
                    credits: 20,
                    rating: 5
                },

                {
                    id: 4,
                    student: "Neha Joshi",
                    skill: "Yoga Classes",
                    date: "15 Jul 2026",
                    duration: "1 Hour",
                    credits: 15,
                    rating: 4
                }

            ]

        };

    },

    computed: {

        filteredHistory() {

            return this.history.filter(item =>

                item.student.toLowerCase().includes(this.search.toLowerCase()) ||

                item.skill.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        exportHistory() {

            alert("Teaching history exported successfully!");

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

Teaching History

</h2>

<div>

<button
class="btn btn-success me-2"
@click="exportHistory">

Export History

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
placeholder="Search History..."
v-model="search">


<table class="table table-hover table-bordered">

<thead class="table-success">

<tr>

<th>ID</th>

<th>Student</th>

<th>Skill</th>

<th>Date</th>

<th>Duration</th>

<th>Credits Earned</th>

<th>Rating</th>

</tr>

</thead>

<tbody>

<tr
v-for="item in filteredHistory"
:key="item.id">

<td>{{item.id}}</td>

<td>{{item.student}}</td>

<td>{{item.skill}}</td>

<td>{{item.date}}</td>

<td>{{item.duration}}</td>

<td>{{item.credits}}</td>

<td>

<span
class="badge bg-warning text-dark">

⭐ {{item.rating}} / 5

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