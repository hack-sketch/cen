export default {

    data() {

        return {

            search: "",

            bookings: [

                {
                    id: 1,
                    student: "Jignesh Bhai",
                    skill: "Python Programming",
                    date: "22 Jul 2026",
                    time: "10:00 AM",
                    credits: 25,
                    status: "Pending"
                },

                {
                    id: 2,
                    student: "Rahul Shah",
                    skill: "Web Development",
                    date: "23 Jul 2026",
                    time: "02:00 PM",
                    credits: 30,
                    status: "Confirmed"
                },

                {
                    id: 3,
                    student: "Priya Patel",
                    skill: "Yoga Classes",
                    date: "24 Jul 2026",
                    time: "09:00 AM",
                    credits: 15,
                    status: "Completed"
                },

                {
                    id: 4,
                    student: "Amit Mehta",
                    skill: "Photography",
                    date: "25 Jul 2026",
                    time: "04:00 PM",
                    credits: 20,
                    status: "Cancelled"
                }

            ]

        };

    },

    computed: {

        filteredBookings() {

            return this.bookings.filter(booking =>

                booking.student.toLowerCase().includes(this.search.toLowerCase()) ||

                booking.skill.toLowerCase().includes(this.search.toLowerCase())

            );

        }

    },

    methods: {

        confirmBooking(booking) {

            booking.status = "Confirmed";

        },

        cancelBooking(booking) {

            booking.status = "Cancelled";

        },

        completeBooking(booking) {

            booking.status = "Completed";

        }

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


<div class="container mt-4">

<div class="d-flex justify-content-between align-items-center mb-4">

<h2>

Bookings

</h2>

<a
href="#/provider"
class="btn btn-secondary">

Back

</a>

</div>


<div class="card shadow">

<div class="card-body">

<input
class="form-control mb-3"
placeholder="Search Bookings..."
v-model="search">


<table class="table table-hover table-bordered">

<thead class="table-success">

<tr>

<th>ID</th>

<th>Student</th>

<th>Skill</th>

<th>Date</th>

<th>Time</th>

<th>Credits</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="booking in filteredBookings"
:key="booking.id">

<td>{{booking.id}}</td>

<td>{{booking.student}}</td>

<td>{{booking.skill}}</td>

<td>{{booking.date}}</td>

<td>{{booking.time}}</td>

<td>{{booking.credits}}</td>

<td>

<span
class="badge"

:class="{

'bg-warning':booking.status==='Pending',

'bg-success':booking.status==='Confirmed',

'bg-primary':booking.status==='Completed',

'bg-danger':booking.status==='Cancelled'

}">

{{booking.status}}

</span>

</td>

<td>

<button
v-if="booking.status==='Pending'"
class="btn btn-success btn-sm me-1"
@click="confirmBooking(booking)">

Accept

</button>

<button
v-if="booking.status==='Pending'"
class="btn btn-danger btn-sm me-1"
@click="cancelBooking(booking)">

Reject

</button>

<button
v-if="booking.status==='Confirmed'"
class="btn btn-primary btn-sm"
@click="completeBooking(booking)">

Complete

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