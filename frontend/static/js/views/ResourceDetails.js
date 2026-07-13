export default {

    data() {
        return {

            resource: null,

            resources: [

                {
                    id: 1,
                    name: "Projector",
                    owner: "Rahul Shah",
                    category: "Electronics",
                    status: "Available",
                    condition: "Excellent",
                    description: "HD Projector suitable for meetings, presentations and movie nights."
                },

                {
                    id: 2,
                    name: "Camping Tent",
                    owner: "Priya Patel",
                    category: "Outdoor",
                    status: "Available",
                    condition: "Good",
                    description: "4-person waterproof camping tent."
                },

                {
                    id: 3,
                    name: "Speaker System",
                    owner: "Amit Mehta",
                    category: "Audio",
                    status: "Borrowed",
                    condition: "Excellent",
                    description: "Portable Bluetooth speaker with microphone."
                },

                {
                    id: 4,
                    name: "Cricket Kit",
                    owner: "Karan Joshi",
                    category: "Sports",
                    status: "Available",
                    condition: "Very Good",
                    description: "Complete cricket kit including bat, pads and gloves."
                }

            ]

        };
    },

    created() {

        const resourceId = parseInt(localStorage.getItem("resourceId"));

        this.resource = this.resources.find(
            resource => resource.id === resourceId
        );

    },

    methods: {

        borrowResource() {

            if (this.resource.status === "Borrowed") {

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

        <button class="btn btn-outline-light"
                onclick="window.location.hash='#/login'">

            Logout

        </button>

    </div>

</nav>


<div class="container mt-4" v-if="resource">

    <div class="card shadow">

        <div class="card-header bg-success text-white">

            <h3>{{ resource.name }}</h3>

        </div>

        <div class="card-body">

            <div class="row">

                <div class="col-md-6">

                    <p>

                        <strong>Owner :</strong>

                        {{ resource.owner }}

                    </p>

                    <p>

                        <strong>Category :</strong>

                        {{ resource.category }}

                    </p>

                    <p>

                        <strong>Condition :</strong>

                        {{ resource.condition }}

                    </p>

                </div>

                <div class="col-md-6">

                    <p>

                        <strong>Status :</strong>

                        <span
                        class="badge"
                        :class="resource.status==='Available'
                            ? 'bg-success'
                            : 'bg-danger'">

                        {{ resource.status }}

                        </span>

                    </p>

                </div>

            </div>

            <hr>

            <h5>Description</h5>

            <p>

                {{ resource.description }}

            </p>

        </div>

        <div class="card-footer">

            <button
                class="btn btn-success me-2"
                @click="borrowResource">

                Request to Borrow

            </button>

            <a
                href="#/resident/resources"
                class="btn btn-secondary">

                Back

            </a>

        </div>

    </div>

</div>

</div>

`

}