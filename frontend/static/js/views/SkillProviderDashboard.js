export default {

    data() {

        return {

            stats: {

                totalSkills: 6,
                activeSkills: 5,
                totalBookings: 42,
                upcomingSessions: 8,
                completedSessions: 34

            },

            upcomingBookings: [

                {
                    student: "Rahul Shah",
                    skill: "Python Programming",
                    date: "21 Jul 2026",
                    time: "10:00 AM",
                    status: "Confirmed"
                },

                {
                    student: "Priya Patel",
                    skill: "Python Programming",
                    date: "22 Jul 2026",
                    time: "02:00 PM",
                    status: "Pending"
                },

                {
                    student: "Amit Mehta",
                    skill: "Web Development",
                    date: "23 Jul 2026",
                    time: "11:30 AM",
                    status: "Confirmed"
                }

            ]

        };

    },

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-success">

<div class="container-fluid">

<a class="navbar-brand fw-bold"
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


<div class="container-fluid">

<div class="row">

<div class="col-md-2 bg-light border-end min-vh-100">

<div class="list-group list-group-flush">

<a
href="#/provider"
class="list-group-item list-group-item-action active">

Dashboard

</a>

<a
href="#/provider/skills"
class="list-group-item list-group-item-action">

My Skills

</a>

<a
href="#/provider/add-skill"
class="list-group-item list-group-item-action">

Add Skill

</a>

<a
href="#/provider/bookings"
class="list-group-item list-group-item-action">

Bookings

</a>

<a
href="#/provider/history"
class="list-group-item list-group-item-action">

Teaching History

</a>

</div>

</div>


<div class="col-md-10 p-4">

<h2 class="mb-4">

Skill Provider Dashboard

</h2>


<div class="row g-4">

<div class="col-md-3">

<div class="card shadow border-primary">

<div class="card-body text-center">

<h2>{{stats.totalSkills}}</h2>

<p>Total Skills</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card shadow border-success">

<div class="card-body text-center">

<h2>{{stats.activeSkills}}</h2>

<p>Active Skills</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card shadow border-warning">

<div class="card-body text-center">

<h2>{{stats.totalBookings}}</h2>

<p>Total Bookings</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card shadow border-danger">

<div class="card-body text-center">

<h2>{{stats.upcomingSessions}}</h2>

<p>Upcoming Sessions</p>

</div>

</div>

</div>

</div>


<div class="card shadow mt-5">

<div class="card-header bg-success text-white">

Upcoming Bookings

</div>

<div class="card-body">

<table class="table table-hover">

<thead>

<tr>

<th>Student</th>

<th>Skill</th>

<th>Date</th>

<th>Time</th>

<th>Status</th>

</tr>

</thead>

<tbody>

<tr
v-for="booking in upcomingBookings"
:key="booking.student + booking.date">

<td>{{booking.student}}</td>

<td>{{booking.skill}}</td>

<td>{{booking.date}}</td>

<td>{{booking.time}}</td>

<td>

<span
class="badge"
:class="booking.status==='Confirmed'
?'bg-success'
:'bg-warning'">

{{booking.status}}

</span>

</td>

</tr>

</tbody>

</table>

</div>

</div>


<div class="row mt-4">

<div class="col-md-4">

<a
href="#/provider/skills"
class="btn btn-success w-100">

Manage Skills

</a>

</div>

<div class="col-md-4">

<a
href="#/provider/add-skill"
class="btn btn-primary w-100">

Add New Skill

</a>

</div>

<div class="col-md-4">

<a
href="#/provider/bookings"
class="btn btn-warning w-100">

View Bookings

</a>

</div>

</div>

</div>

</div>

</div>

</div>

`

}