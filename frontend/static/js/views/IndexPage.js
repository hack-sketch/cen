export default {
  template: `
  <div>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold text-success" href="#/">
          🌐 Community Exchange Network
        </a>
        <div>
          <a href="#/login" class="btn btn-outline-success me-2">Login</a>
          <a href="#/register" class="btn btn-success">Register</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="text-center py-5 bg-light">
      <div class="container">
        <h1 class="display-4 fw-bold text-success">
          Bringing Neighbors Together
        </h1>
        <p class="lead mt-3 text-muted">
          Exchange skills, share resources, and grow as a community.
        </p>
        <div class="mt-4">
          <img 
            src="https://copilot.microsoft.com/th/id/BCO.9d7e72db-216d-41e7-b48c-35b6913ce7df.png"
            class="img-fluid rounded"
            style="max-height:350px;"
            alt="Community theme illustration"
          >
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="container py-5">
      <h2 class="text-center mb-5 fw-bold">What You Can Do</h2>
      <div class="row g-4 text-center">

        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h4>🎉 Events</h4>
              <p>Join festivals and meetups.</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h4>📦 Share</h4>
              <p>Borrow and lend items.</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h4>🤝 Volunteer</h4>
              <p>Help neighbors and earn credits.</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h4>🎓 Skill Exchange</h4>
              <p>Learn and teach within the community.</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-success text-white text-center py-3">
      <p class="mb-0">© 2026 Community Exchange Network</p>
    </footer>

  </div>
  `
};
