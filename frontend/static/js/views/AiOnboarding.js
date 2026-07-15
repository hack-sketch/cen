export default {
  template: `
  <div class="bg-light min-vh-100 d-flex align-items-center py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          
          <!-- Header -->
          <div class="text-center mb-4">
            <h2 class="fw-bold text-dark">Let's set up your profile</h2>
            <p class="text-muted">Tell us about yourself in plain English, and our AI will handle the rest.</p>
          </div>

          <!-- Main Card -->
          <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5">
            
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark">Who are you and what can you do?</label>
              <textarea 
                class="form-control" 
                rows="4" 
                placeholder="e.g., I'm a CS student. I play guitar and can do basic video editing..."
                v-model="bio"
                :disabled="isAnalyzing || showResults"
              ></textarea>
            </div>

            <!-- Magic Setup Button -->
            <button 
              v-if="!showResults"
              class="btn w-100 fw-semibold text-white mb-3 shadow-sm" 
              style="background-color: #5b4b8a; height: 48px;"
              @click="analyzeBio"
              :disabled="isAnalyzing || !bio.trim()"
            >
              <span v-if="isAnalyzing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isAnalyzing ? 'Analyzing your bio...' : '✨ Magic Setup' }}
            </button>

            <!-- AI Results Box -->
            <div v-if="showResults" class="p-4 rounded-4 border border-dashed mb-4" style="background-color: #ece9f5; border-color: #b7abdd;">
              <div class="d-flex align-items-center mb-3">
                <span class="fs-5 me-2">🔮</span>
                <h6 class="fw-bold mb-0" style="color: #5b4b8a;">AI Extracted Profile</h6>
              </div>
              
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span v-for="tag in aiTags" :key="tag" class="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm">
                  #{{ tag }}
                </span>
              </div>
              
              <p class="small mb-0" style="color: #4a3d73;">
                We've drafted these skill tags for you. You can review and publish them from your dashboard later.
              </p>
            </div>

            <!-- Continue Button -->
            <button 
              v-if="showResults"
              class="btn btn-success w-100 fw-semibold"
              style="height: 48px;"
              @click="continueToDashboard"
            >
              Continue to Dashboard
            </button>
            
            <div class="text-center mt-3" v-if="!showResults">
              <button class="btn btn-link text-muted small text-decoration-none" @click="skipSetup">
                Skip for now
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      bio: "",
      isAnalyzing: false,
      showResults: false,
      aiTags: []
    };
  },

  methods: {
    analyzeBio() {
      this.isAnalyzing = true;
      
      // Simulate backend AI API call
      setTimeout(() => {
        // Mock extraction logic based on keywords
        const text = this.bio.toLowerCase();
        const extracted = [];
        
        if (text.includes('student') || text.includes('cs')) extracted.push('Student');
        if (text.includes('guitar') || text.includes('music')) extracted.push('Music');
        if (text.includes('video') || text.includes('edit')) extracted.push('Video Editing');
        if (text.includes('code') || text.includes('python')) extracted.push('Programming');
        if (extracted.length === 0) extracted.push('General Volunteer', 'Community Member');

        this.aiTags = extracted;
        this.isAnalyzing = false;
        this.showResults = true;
      }, 1500);
    },
    
    continueToDashboard() {
      // In a real app, you'd save these tags to the user profile in the backend first
      window.location.hash = "#/resident";
    },

    skipSetup() {
      window.location.hash = "#/resident";
    }
  }
};