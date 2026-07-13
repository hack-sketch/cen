export default {
  template: `
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-5 col-lg-4">
        <div class="card border-0 shadow-sm rounded-3">
          <div class="card-header bg-success text-white text-center rounded-top-3 py-2">
            <h4 class="mb-0">Login</h4>
          </div>

          <div class="card-body p-3">
            <div v-if="error" class="alert alert-danger text-center py-1 mb-3">
              {{ error }}
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold">Email</label>
              <input
                type="email"
                class="form-control form-control-sm"
                placeholder="Enter email"
                v-model="email"
              >
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold">Password</label>
              <input
                type="password"
                class="form-control form-control-sm"
                placeholder="Enter password"
                v-model="password"
              >
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">Login As</label>
              <select class="form-select form-select-sm" v-model="role">
                <option value="">Select Role</option>
                <option value="resident">Resident</option>
                <option value="owner">Resource Owner</option>
                <option value="provider">Skill Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              class="btn btn-success w-100 btn-sm fw-semibold"
              @click="login"
              :disabled="loading"
            >
              <span v-if="loading">Logging in...</span>
              <span v-else>Login</span>
            </button>

            <div class="text-center mt-2">
              <small>Don't have an account?
                <a href="#/register" class="text-success fw-semibold">Register</a>
              </small>
            </div>

            <div class="text-center mt-1">
              <a href="#/" class="text-muted small">← Back to Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      email: "",
      password: "",
      role: "",
      error: "",
      loading: false
    };
  },

  methods: {
    login() {
      this.error = "";
      if (!this.email || !this.password || !this.role) {
        this.error = "Please fill all fields and select a role.";
        return;
      }
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        window.location.hash = "#/" + this.role;
      }, 800);
    }
  }
};
