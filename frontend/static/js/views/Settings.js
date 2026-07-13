export default {

    data() {
        return {

            settings: {

                communityName: "Green Valley Residency",
                adminEmail: "admin@community.com",
                notifications: true,
                maintenanceMode: false

            }

        };

    },

    methods: {

        saveSettings() {

            alert("Settings saved successfully!");

        }

    },

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">

<div class="container-fluid">

<a class="navbar-brand fw-bold" href="#/admin">
CEN Admin Panel
</a>

<button class="btn btn-outline-light"
onclick="window.location.hash='#/login'">
Logout
</button>

</div>

</nav>

<div class="container mt-4">

<div class="d-flex justify-content-between align-items-center mb-4">

<h2>Settings</h2>

<a href="#/admin" class="btn btn-secondary">
Back
</a>

</div>

<div class="card shadow">

<div class="card-body">

<div class="mb-3">

<label class="form-label">Community Name</label>

<input
class="form-control"
v-model="settings.communityName">

</div>

<div class="mb-3">

<label class="form-label">Admin Email</label>

<input
type="email"
class="form-control"
v-model="settings.adminEmail">

</div>

<div class="form-check form-switch mb-3">

<input
class="form-check-input"
type="checkbox"
v-model="settings.notifications">

<label class="form-check-label">
Enable Notifications
</label>

</div>

<div class="form-check form-switch mb-4">

<input
class="form-check-input"
type="checkbox"
v-model="settings.maintenanceMode">

<label class="form-check-label">
Maintenance Mode
</label>

</div>

<button
class="btn btn-success"
@click="saveSettings">

Save Settings

</button>

</div>

</div>

</div>

</div>

`

}