export default {

    data() {
        return {

            resources: [

                {
                    id: 1,
                    name: "Projector",
                    owner: "Rahul Shah",
                    category: "Electronics",
                    status: "Available"
                },

                {
                    id: 2,
                    name: "Camping Tent",
                    owner: "Priya Patel",
                    category: "Outdoor",
                    status: "Available"
                },

                {
                    id: 3,
                    name: "Speaker System",
                    owner: "Amit Mehta",
                    category: "Audio",
                    status: "Borrowed"
                },

                {
                    id: 4,
                    name: "Cricket Kit",
                    owner: "Karan Joshi",
                    category: "Sports",
                    status: "Available"
                }

            ]

        };
    },

    methods: {

        viewResource(id) {

            localStorage.setItem("resourceId", id);

            window.location.hash = "#/resident/resource";

        },

        borrow(resource) {

            if (resource.status === "Borrowed") {

                alert("This resource is currently unavailable.");

                return;

            }

            alert("Borrow request submitted successfully!");

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

        <h2>Community Resources</h2>

        <a href="#/resident"
           class="btn btn-secondary">

            Back

        </a>

    </div>

    <div class="row">

        <div
            class="col-md-6 col-lg-4 mb-4"
            v-for="resource in resources"
            :key="resource.id">

            <div class="card shadow h-100">

                <div class="card-body">

                    <h4>{{ resource.name }}</h4>

                    <p>

                        <strong>Owner:</strong>

                        {{ resource.owner }}

                    </p>

                    <p>

                        <strong>Category:</strong>

                        {{ resource.category }}

                    </p>

                    <p>

                        <strong>Status:</strong>

                        <span
                            class="badge"
                            :class="resource.status==='Available'
                                ? 'bg-success'
                                : 'bg-danger'">

                            {{ resource.status }}

                        </span>

                    </p>

                </div>

                <div class="card-footer d-flex justify-content-between">

                    <button
                        class="btn btn-primary btn-sm"
                        @click="viewResource(resource.id)">

                        View

                    </button>

                    <button
                        class="btn btn-success btn-sm"
                        @click="borrow(resource)">

                        Borrow

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

</div>

`

}