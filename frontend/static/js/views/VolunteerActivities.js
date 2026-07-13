const VolunteerActivities = {
    template: `
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Volunteer Activities</h2>
                <span class="badge bg-success fs-6">Earn Credits</span>
            </div>
            
            <p class="text-muted">Join community initiatives, help your neighbors, and earn time credits for your wallet.</p>
            
            <div class="row g-4 mt-2">
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Community Garden Cleanup</h5>
                            <p class="card-text text-secondary">Help plant new seasonal vegetables and tidy up the neighborhood shared green space.</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="text-primary font-monospace fw-bold">+15 Credits/hr</span>
                                <button class="btn btn-outline-primary btn-sm" @click="signUp('Garden Cleanup')">Sign Up</button>
                            </div>
                        </div>
                        <div class="card-footer text-muted small">Date: Upcoming Saturday</div>
                    </div>
                </div>

                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Elderly Tech Assistance</h5>
                            <p class="card-text text-secondary">Spend two hours helping senior community residents set up their tablets, smartphones, or video calls.</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="text-primary font-monospace fw-bold">+20 Credits/hr</span>
                                <button class="btn btn-outline-primary btn-sm" @click="signUp('Tech Assistance')">Sign Up</button>
                            </div>
                        </div>
                        <div class="card-footer text-muted small">Date: Every Thursday</div>
                    </div>
                </div>

                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Neighborhood Food Drive</h5>
                            <p class="card-text text-secondary">Assist with sorting, packing, and distributing incoming donations at the community center.</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="text-primary font-monospace fw-bold">+10 Credits/hr</span>
                                <button class="btn btn-outline-primary btn-sm" @click="signUp('Food Drive')">Sign Up</button>
                            </div>
                        </div>
                        <div class="card-footer text-muted small">Date: Next Sunday</div>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        signUp(activityName) {
            alert(`Successfully signed up for: ${activityName}! (Frontend Simulation)`);
        }
    }
};

export default VolunteerActivities;