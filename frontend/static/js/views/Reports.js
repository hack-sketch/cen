export default {

    data() {
        return {

            reports: [

                {
                    id: 1,
                    title: "Monthly Community Activity Report",
                    period: "July 2026",
                    generatedOn: "01 Aug 2026",
                    status: "Generated"
                },

                {
                    id: 2,
                    title: "Volunteer Participation Report",
                    period: "July 2026",
                    generatedOn: "01 Aug 2026",
                    status: "Generated"
                },

                {
                    id: 3,
                    title: "Resource Sharing Report",
                    period: "July 2026",
                    generatedOn: "01 Aug 2026",
                    status: "Generated"
                },

                {
                    id: 4,
                    title: "Community Credit Report",
                    period: "July 2026",
                    generatedOn: "01 Aug 2026",
                    status: "Pending"
                }

            ]

        };

    },

    methods: {

        viewReport(report){

            alert("Opening " + report.title);

        },

        downloadPDF(report){

            alert("Downloading PDF for " + report.title);

        },

        downloadCSV(report){

            alert("Downloading CSV for " + report.title);

        },

        generateReport(){

            alert("Monthly Report Generated Successfully!");

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

Reports

</h2>

<div>

<button
class="btn btn-success me-2"
@click="generateReport">

Generate Report

</button>

<a
href="#/admin"
class="btn btn-secondary">

Back

</a>

</div>

</div>


<div class="card shadow">

<div class="card-body">

<table class="table table-hover table-bordered">

<thead class="table-dark">

<tr>

<th>ID</th>

<th>Report</th>

<th>Period</th>

<th>Generated On</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody>

<tr
v-for="report in reports"
:key="report.id">

<td>{{report.id}}</td>

<td>{{report.title}}</td>

<td>{{report.period}}</td>

<td>{{report.generatedOn}}</td>

<td>

<span
class="badge"
:class="report.status==='Generated'
?'bg-success'
:'bg-warning'">

{{report.status}}

</span>

</td>

<td>

<button
class="btn btn-primary btn-sm me-1"
@click="viewReport(report)">

View

</button>

<button
class="btn btn-danger btn-sm me-1"
@click="downloadPDF(report)">

PDF

</button>

<button
class="btn btn-success btn-sm"
@click="downloadCSV(report)">

CSV

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