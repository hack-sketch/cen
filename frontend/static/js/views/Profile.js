export default {

    data() {
        return {

            user: {

                name: "Jignesh Bhai",
                email: "jignesh@example.com",
                phone: "9876543210",
                society: "Green Valley Residency",
                role: "Resident",
                credits: 120

            }

        };

    },

    methods: {

        saveProfile() {

            alert("Profile updated successfully!");

        }

    },

    template: `

<div>

<nav class="navbar navbar-expand-lg navbar-dark bg-success">

    <div class="container-fluid">

        <a class="navbar-brand fw-bold"
           href="#/resident">

            Community Exchange Network

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

        <h2>My Profile</h2>

        <a
            href="#/resident"
            class="btn btn-secondary">

            Back

        </a>

    </div>


    <div class="row">

        <!-- Profile Card -->
        <div class="col-md-4">

            <div class="card shadow">

                <div class="card-body text-center">

                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        class="rounded-circle mb-3"
                        width="120">

                    <h4>{{ user.name }}</h4>

                    <p class="text-muted">

                        {{ user.role }}

                    </p>

                    <h5 class="text-success">

                        {{ user.credits }} Credits

                    </h5>

                    <button class="btn btn-outline-success btn-sm mt-2">

                        Change Photo

                    </button>

                </div>

            </div>

        </div>


        <!-- Profile Form -->
        <div class="col-md-8">

            <div class="card shadow">

                <div class="card-header bg-success text-white">

                    Personal Information

                </div>

                <div class="card-body">

                    <div class="row">

                        <div class="col-md-6 mb-3">

                            <label class="form-label">

                                Full Name

                            </label>

                            <input
                                class="form-control"
                                v-model="user.name">

                        </div>

                        <div class="col-md-6 mb-3">

                            <label class="form-label">

                                Email

                            </label>

                            <input
                                class="form-control"
                                v-model="user.email">

                        </div>

                    </div>


                    <div class="row">

                        <div class="col-md-6 mb-3">

                            <label class="form-label">

                                Phone

                            </label>

                            <input
                                class="form-control"
                                v-model="user.phone">

                        </div>

                        <div class="col-md-6 mb-3">

                            <label class="form-label">

                                Society

                            </label>

                            <input
                                class="form-control"
                                v-model="user.society">

                        </div>

                    </div>

                    <div class="mb-3">

                        <label class="form-label">

                            Role

                        </label>

                        <input
                            class="form-control"
                            :value="user.role"
                            disabled>

                    </div>

                    <button
                        class="btn btn-success"
                        @click="saveProfile">

                        Save Changes

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

</div>

`

}