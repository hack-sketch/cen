export default {
    template: `
    <div>

        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-success">
            <div class="container-fluid">

                <a class="navbar-brand fw-bold" href="#/resident">
                    Community Exchange Network
                </a>

                <button class="btn btn-outline-light"
                        onclick="window.location.hash='#/login'">
                    Logout
                </button>

            </div>
        </nav>

        <div class="container-fluid">

            <div class="row">

                <!-- Sidebar -->
                <div class="col-md-3 col-lg-2 bg-light border-end min-vh-100">

                    <div class="list-group list-group-flush">

                        <a href="#/resident"
                           class="list-group-item list-group-item-action active">
                           Dashboard
                        </a>

                        <a href="#/resident/events"
                           class="list-group-item list-group-item-action">
                           Events
                        </a>

                        <a href="#/resident/resources"
                           class="list-group-item list-group-item-action">
                           Resources
                        </a>

                        <a href="#/resident/volunteers"
                           class="list-group-item list-group-item-action">
                           Volunteers
                        </a>

                        <a href="#/resident/skills"
                           class="list-group-item list-group-item-action">
                           Skill Exchange
                        </a>

                        <a href="#/resident/wallet"
                           class="list-group-item list-group-item-action">
                           Credit Wallet
                        </a>

                        <a href="#/resident/profile"
                           class="list-group-item list-group-item-action">
                           Profile
                        </a>

                    </div>

                </div>

                <!-- Main Content -->
                <div class="col-md-9 col-lg-10 p-4">

                    <h2>Resident Dashboard</h2>

                    <p class="text-muted">
                        Welcome back, Jignesh!
                    </p>

                    <div class="row g-4 mt-2">

                        <div class="col-md-4">
                            <div class="card border-success shadow-sm">

                                <div class="card-body text-center">

                                    <h1>5</h1>

                                    <h5>Upcoming Events</h5>

                                </div>

                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="card border-primary shadow-sm">

                                <div class="card-body text-center">

                                    <h1>8</h1>

                                    <h5>Resources Available</h5>

                                </div>

                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="card border-warning shadow-sm">

                                <div class="card-body text-center">

                                    <h1>120</h1>

                                    <h5>Community Credits</h5>

                                </div>

                            </div>
                        </div>

                    </div>

                    <div class="card mt-5 shadow-sm">

                        <div class="card-header bg-success text-white">
                            Recent Activities
                        </div>

                        <div class="card-body">

                            <ul class="list-group">

                                <li class="list-group-item">
                                    Registered for Tree Plantation Event
                                </li>

                                <li class="list-group-item">
                                    Borrowed Projector
                                </li>

                                <li class="list-group-item">
                                    Earned 20 Community Credits
                                </li>

                                <li class="list-group-item">
                                    Booked Yoga Session
                                </li>

                            </ul>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    </div>
    `
}