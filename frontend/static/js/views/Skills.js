export default {

    data() {
        return {

            skills: [

                {
                    id: 1,
                    title: "Yoga Classes",
                    provider: "Priya Patel",
                    category: "Health & Fitness",
                    credits: 15
                },

                {
                    id: 2,
                    title: "Guitar Lessons",
                    provider: "Rahul Shah",
                    category: "Music",
                    credits: 20
                },

                {
                    id: 3,
                    title: "Python Programming",
                    provider: "Amit Mehta",
                    category: "Technology",
                    credits: 25
                },

                {
                    id: 4,
                    title: "Cooking Workshop",
                    provider: "Neha Joshi",
                    category: "Cooking",
                    credits: 10
                }

            ]

        };

    },

    methods: {

        bookSkill(skill) {

            alert(
                "Successfully booked '" +
                skill.title +
                "' with " +
                skill.provider + "."
            );

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

        <h2>Skill Exchange Marketplace</h2>

        <a href="#/resident"
           class="btn btn-secondary">

            Back

        </a>

    </div>

    <div class="row">

        <div
            class="col-md-6 col-lg-4 mb-4"
            v-for="skill in skills"
            :key="skill.id">

            <div class="card shadow h-100">

                <div class="card-body">

                    <h4>{{ skill.title }}</h4>

                    <p>

                        <strong>Provider:</strong>

                        {{ skill.provider }}

                    </p>

                    <p>

                        <strong>Category:</strong>

                        {{ skill.category }}

                    </p>

                    <p>

                        <strong>Required Credits:</strong>

                        {{ skill.credits }}

                    </p>

                </div>

                <div class="card-footer text-center">

                    <button
                        class="btn btn-success"
                        @click="bookSkill(skill)">

                        Book Session

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>

</div>

`

}