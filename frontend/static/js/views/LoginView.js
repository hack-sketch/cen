export default {
    template: `
    <div class="container py-5">

        <div class="row justify-content-center">

            <div class="col-md-6">

                <div class="card shadow">

                    <div class="card-header bg-success text-white text-center">
                        <h3>Login</h3>
                    </div>

                    <div class="card-body">

                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input
                                type="email"
                                class="form-control"
                                placeholder="Enter your email"
                                v-model="email"
                            >
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input
                                type="password"
                                class="form-control"
                                placeholder="Enter your password"
                                v-model="password"
                            >
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Login As</label>

                            <select class="form-select" v-model="role">
                                <option value="">Select Role</option>
                                <option value="resident">Resident</option>
                                <option value="owner">Resource Owner</option>
                                <option value="provider">Skill Provider</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button
                            class="btn btn-success w-100"
                            @click="login"
                        >
                            Login
                        </button>

                        <div class="text-center mt-3">
                            Don't have an account?
                            <a href="#/register">
                                Register
                            </a>
                        </div>

                        <div class="text-center mt-2">
                            <a href="#/">
                                ← Back to Home
                            </a>
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
            role: ""
        };
    },

    methods: {

        login() {

            if (this.role === "") {
                alert("Please select a role.");
                return;
            }

            switch (this.role) {

                case "resident":
                    window.location.hash = "#/resident";
                    break;

                case "owner":
                    window.location.hash = "#/owner";
                    break;

                case "provider":
                    window.location.hash = "#/provider";
                    break;

                case "admin":
                    window.location.hash = "#/admin";
                    break;
            }

        }

    }

};