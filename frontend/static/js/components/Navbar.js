export default {
  props: ['title', 'rolePath'],
  template: `
    <nav class="navbar bg-white py-3 border-bottom shadow-sm">
      <div class="container-fluid px-4">
        
        <div class="d-flex align-items-center gap-3">
          <button class="navbar-toggler border-0 shadow-none p-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#mainSidebar">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <a class="navbar-brand fw-bold text-dark fs-5 mb-0" :href="rolePath">{{ title }}</a>
        </div>

        <div class="ms-auto d-flex align-items-center gap-3">
          <span class="d-none d-sm-inline text-dark fw-medium">Status: <span class="text-success">🟢 Online</span></span>
          
          <div class="vr bg-secondary opacity-25 d-none d-sm-block"></div>
          
          <button class="btn btn-outline-danger btn-sm fw-semibold px-3" onclick="window.location.hash='#/login'">
            🚪 Logout
          </button>
        </div>

      </div>
    </nav>
  `
};