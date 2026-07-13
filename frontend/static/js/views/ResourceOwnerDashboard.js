export default {

    data() {
        return {

            stats: {

                totalResources: 8,
                availableResources: 5,
                borrowedResources: 2,
                pendingRequests: 4,
                completedTransactions: 18

            },

            recentRequests: [

                {
                    resident: "Rahul Shah",
                    resource: "Projector",
                    date: "18 Jul 2026",
                    status: "Pending"
                },

                {
                    resident: "Priya Patel",
                    resource: "Camping Tent",
                    date: "17 Jul 2026",
                    status: "Approved"
                },

                {
                    resident: "Amit Mehta",
                    resource: "Speaker System",
                    date: "16 Jul 2026",
                    status: "Returned"
                }

            ]

        };

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


<div class="container-fluid">

<div class="row">

<div class="col-md-2 bg-light border-end min-vh-100">

<div class="list-group list-group-flush">

<a
href="#/owner"
class="list-group-item list-group-item-action active">

Dashboard

</a>

<a
href="#/owner/resources"
class="list-group-item list-group-item-action">

My Resources

</a>

<a
href="#/owner/add-resource"
class="list-group-item list-group-item-action">

Add Resource

</a>

<a
href="#/owner/requests"
class="list-group-item list-group-item-action">

Borrow Requests

</a>

<a
href="#/owner/history"
class="list-group-item list-group-item-action">

Borrow History

</a>

</div>

</div>


<div class="col-md-10 p-4">

<h2 class="mb-4">

Resource Owner Dashboard

</h2>


<div class="row g-4">

<div class="col-md-3">

<div class="card shadow border-primary">

<div class="card-body text-center">

<h2>{{stats.totalResources}}</h2>

<p>Total Resources</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card shadow border-success">

<div class="card-body text-center">

<h2>{{stats.availableResources}}</h2>

<p>Available</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card shadow border-warning">

<div class="card-body text-center">

<h2>{{stats.borrowedResources}}</h2>

<p>Borrowed</p>

</div>

</div>

</div>


<div class="col-md-3">

<div class="card shadow border-danger">

<div class="card-body text-center">

<h2>{{stats.pendingRequests}}</h2>

<p>Pending Requests</p>

</div>

</div>

</div>

</div>


<div class="card shadow mt-5">

<div class="card-header bg-primary text-white">

Recent Borrow Requests

</div>

<div class="card-body">

<table class="table table-hover">

<thead>

<tr>

<th>Resident</th>

<th>Resource</th>

<th>Date</th>

<th>Status</th>

</tr>

</thead>

<tbody>

<tr
v-for="request in recentRequests"
:key="request.resource">

<td>{{request.resident}}</td>

<td>{{request.resource}}</td>

<td>{{request.date}}</td>

<td>

<span
class="badge"

:class="{

'bg-warning':request.status=='Pending',

'bg-success':request.status=='Approved',

'bg-primary':request.status=='Returned'

}">

{{request.status}}

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
href="#/owner/resources"
class="btn btn-primary w-100">

Manage Resources

</a>

</div>

<div class="col-md-4">

<a
href="#/owner/add-resource"
class="btn btn-success w-100">

Add New Resource

</a>

</div>

<div class="col-md-4">

<a
href="#/owner/requests"
class="btn btn-warning w-100">

View Requests

</a>

</div>

</div>

</div>

</div>

</div>

</div>

`

}