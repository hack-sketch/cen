export default {
    template: `
    <div>

        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
            <div class="container">

                <a class="navbar-brand fw-bold" href="#/">
                    Community Exchange Network
                </a>

                <div>
                    <a href="#/login" class="btn btn-outline-light me-2">
                        Login
                    </a>

                    <a href="#/register" class="btn btn-light">
                        Register
                    </a>
                </div>

            </div>
        </nav>

        <!-- Hero Section -->
        <div class="container py-5">

            <div class="row align-items-center">

                <div class="col-lg-6">

                    <h1 class="display-4 fw-bold">
                        Welcome to Community Exchange Network
                    </h1>

                    <p class="lead mt-4">
                        A residential community platform where residents can
                        participate in events, share resources, volunteer for
                        activities, offer skills, and earn community credits.
                    </p>

                    <div class="mt-4">

                        <a href="#/login" class="btn btn-success btn-lg me-3">
                            Login
                        </a>

                        <a href="#/register" class="btn btn-outline-success btn-lg">
                            Register
                        </a>

                    </div>

                </div>

                <div class="col-lg-6 text-center">

                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        class="img-fluid"
                        style="max-height:350px;"
                    >

                </div>

            </div>

        </div>

        <!-- Features -->
        <div class="container mb-5">

            <h2 class="text-center mb-5">
                Platform Features
            </h2>

            <div class="row g-4">

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">

                        <div class="card-body text-center">

                            <h4>🎉 Events</h4>

                            <p>
                                Participate in community events and festivals.
                            </p>

                        </div>

                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">

                        <div class="card-body text-center">

                            <h4>📦 Resource Sharing</h4>

                            <p>
                                Borrow and lend useful community resources.
                            </p>

                        </div>

                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">

                        <div class="card-body text-center">

                            <h4>🤝 Volunteer</h4>

                            <p>
                                Join volunteer activities and earn credits.
                            </p>

                        </div>

                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">

                        <div class="card-body text-center">

                            <h4>🎓 Skill Exchange</h4>

                            <p>
                                Learn and teach skills within the community.
                            </p>

                        </div>

                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">

                        <div class="card-body text-center">

                            <h4>💰 Credit Wallet</h4>

                            <p>
                                Earn and redeem community credits.
                            </p>

                        </div>

                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">

                        <div class="card-body text-center">

                            <h4>📊 Analytics</h4>

                            <p>
                                Community coordinators can monitor engagement and activities.
                            </p>

                        </div>

                    </div>
                </div>

            </div>

        </div>

        <!-- Footer -->
        <footer class="bg-dark text-white text-center py-3">

            <p class="mb-0">
                © 2026 Community Exchange Network (CEN)
            </p>

        </footer>

    </div>
    `
};