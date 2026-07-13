export default {
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow rounded-4">
            <div class="card-header bg-success text-white text-center">
              <h3>Create Account</h3>
            </div>
            <div class="card-body p-4">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-control" placeholder="Enter Full Name" v-model="user.name">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" placeholder="Enter Email" v-model="user.email">
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Phone Number</label>
                  <input type="text" class="form-control" placeholder="Enter Phone Number" v-model="user.phone">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Role</label>
                  <select class="form-select" v-model="user.role">
                    <option value="">Select Role</option>
                    <option>Resident</option>
                    <option>Resource Owner</option>
                    <option>Skill Provider</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" placeholder="Enter Password" v-model="user.password">
              </div>

              <div class="mb-3">
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-control" placeholder="Confirm Password" v-model="confirmPassword">
              </div>

              <!-- Centered Register Button -->
              <div class="text-center">
                <button class="btn btn-success w-50 fw-semibold" @click="register">Register</button>
              </div>

              <div class="text-center mt-3">
                Already have an account?
                <a href="#/login">Login</a>
              </div>

              <div class="text-center mt-2">
                <a href="#/">← Back to Home</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      user: {
        name: "",
        email: "",
        phone: "",
        role: "",
        password: ""
      },
      confirmPassword: ""
    };
  },

  methods: {
    register() {
      if (
        this.user.name === "" ||
        this.user.email === "" ||
        this.user.role === "" ||
        this.user.password === ""
      ) {
        alert("Please fill all required fields.");
        return;
      }

      if (this.user.password !== this.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      alert("Registration Successful!");
      window.location.hash = "#/login";
    }
  }
};
