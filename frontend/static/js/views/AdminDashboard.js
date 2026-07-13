export default {

    data() {
        return {

            stats: {

                residents: 245,
                resourceOwners: 38,
                skillProviders: 27,
                events: 18,
                resources: 96,
                volunteerActivities: 14,
                totalCredits: 5420

            },

            recentActivities: [

                {
                    activity: "New resident registered",
                    time: "10 mins ago"
                },

                {
                    activity: "Tree Plantation Event created",
                    time: "30 mins ago"
                },

                {
                    activity: "Projector added to Resource Hub",
                    time: "1 hour ago"
                },

                {
                    activity: "Yoga Workshop completed",
                    time: "Today"
                },

                {
                    activity: "Monthly report generated",
                    time: "Yesterday"
                }

            ]

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


<div class="container-fluid">

<div class="row">

<!-- Sidebar -->

<div class="col-md-2 bg-light border-end min-vh-100">

<div class="list-group list-group-flush">

<a href="#/admin"
class="list-group-item list-group-item-action active">
Dashboard
</a>

<a href="#/admin/residents"
class="list-group-item list-group-item-action">
Residents
</a>

<a href="#/admin/events"
class="list-group-item list-group-item-action">
Events
</a>

<a href="#/admin/resources"
class="list-group-item list-group-item-action">
Resources
</a>

<a href="#/admin/skills"
class="list-group-item list-group-item-action">
Skills
</a>

<a href="#/admin/volunteers"
class="list-group-item list-group-item-action">
Volunteer Activities
</a>

<a href="#/admin/analytics"
class="list-group-item list-group-item-action">
Analytics
</a>

<a href="#/admin/reports"
class="list-group-item list-group-item-action">
Reports
</a>

<a href="#/admin/settings"
class="list-group-item list-group-item-action">
Settings
</a>

</div>

</div>


<!-- Main Content -->

<div class="col-md-10 p-4">

<h2 class="mb-4">
Admin Dashboard
</h2>

<div class="row g-4">

<div class="col-md-3">
<div class="card border-primary shadow-sm">
<div class="card-body text-center">
<h2>{{stats.residents}}</h2>
<p>Total Residents</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card border-success shadow-sm">
<div class="card-body text-center">
<h2>{{stats.resourceOwners}}</h2>
<p>Resource Owners</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card border-warning shadow-sm">
<div class="card-body text-center">
<h2>{{stats.skillProviders}}</h2>
<p>Skill Providers</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card border-danger shadow-sm">
<div class="card-body text-center">
<h2>{{stats.events}}</h2>
<p>Events</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card border-info shadow-sm">
<div class="card-body text-center">
<h2>{{stats.resources}}</h2>
<p>Resources</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card border-secondary shadow-sm">
<div class="card-body text-center">
<h2>{{stats.volunteerActivities}}</h2>
<p>Volunteer Activities</p>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card border-dark shadow-sm">
<div class="card-body text-center">
<h2>{{stats.totalCredits}}</h2>
<p>Community Credits</p>
</div>
</div>
</div>

</div>


<div class="card mt-5 shadow">

<div class="card-header bg-dark text-white">

Recent Activities

</div>

<div class="card-body">

<table class="table table-hover">

<thead>

<tr>

<th>Activity</th>
<th>Time</th>

</tr>

</thead>

<tbody>

<tr
v-for="activity in recentActivities"
:key="activity.activity">

<td>{{activity.activity}}</td>

<td>{{activity.time}}</td>

</tr>

</tbody>

</table>

</div>

</div>

</div>

</div>

</div>

</div>

`

}