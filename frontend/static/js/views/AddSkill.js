export default {

  data() {
    return {
      isGenerating: false,
      showAiBox: false,
      aiError: null,
      aiTags: [],
      skill: {
        name: "",
        category: "",
        description: "",
        duration: "",
        credits: "",
        level: "",
        status: "Active"
      }
    };
  },

  methods: {
    async generateAiSuggestions() {
      if (!this.skill.name || !this.skill.description) {
        alert("Please enter a Skill Name and Description first.");
        return;
      }

      this.isGenerating = true;
      this.aiError = null;
      this.showAiBox = false;

      try {
        // Ready for the backend API connection
        const response = await axios.post("http://localhost:5000/api/ai/suggest-skill", {
          name: this.skill.name,
          description: this.skill.description
        });

        // Auto-fill the form with the backend's response
        this.skill.category = response.data.category;
        this.skill.credits = response.data.credits;
        this.aiTags = response.data.tags;
        
        this.showAiBox = true;
      } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
        this.aiError = "AI service is currently unavailable.";
      } finally {
        this.isGenerating = false;
      }
    },

    async saveSkill() {
      // Backend integration for saving the skill
      try {
        await axios.post("http://localhost:5000/api/skills", this.skill);
        alert("Skill added successfully!");
        window.location.hash = "#/provider/skills";
      } catch (error) {
        alert("Failed to save skill. Please try again.");
        console.error(error);
      }
    },
    
    resetForm() {
      this.showAiBox = false;
      this.aiTags = [];
      this.aiError = null;
      this.skill = { 
        name: "", 
        category: "", 
        description: "", 
        duration: "", 
        credits: "", 
        level: "", 
        status: "Active" 
      };
    }
  },

  template: `
  <div>

    <!-- Navbar with Sidebar Toggle -->
    <app-navbar title="Skill Provider Portal" rolePath="#/provider"></app-navbar>
    <app-sidebar role="provider" activePage="Add Skill"></app-sidebar>

    <!-- Main Content -->
    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Add New Skill</h2>

      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow rounded-4">
            <div class="card-header bg-danger text-white fw-semibold rounded-top-4">
              Skill Information
            </div>
            <div class="card-body p-3">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Skill Name</label>
                  <input type="text" class="form-control form-control-sm" v-model="skill.name" placeholder="Enter Skill Name">
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Category</label>
                  <select class="form-select form-select-sm" v-model="skill.category">
                    <option value="">Select Category</option>
                    <option>Technology</option>
                    <option>Fitness</option>
                    <option>Music</option>
                    <option>Arts</option>
                    <option>Cooking</option>
                    <option>Education</option>
                    <option>Language</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>

              <div class="mb-2">
                <label class="form-label small fw-semibold">Description</label>
                <textarea rows="3" class="form-control form-control-sm" v-model="skill.description" placeholder="Describe your skill"></textarea>
              </div>

              <!-- AI Trigger Button -->
              <div class="d-grid mb-3">
                <button type="button" class="btn text-white fw-semibold shadow-sm" style="background-color: #5b4b8a;" @click="generateAiSuggestions" :disabled="isGenerating">
                  <span v-if="isGenerating" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isGenerating ? 'Analyzing with AI...' : '✨ Suggest Smart Price & Tags' }}
                </button>
              </div>

              <!-- Error Message -->
              <div v-if="aiError" class="alert alert-danger py-2 small">{{ aiError }}</div>

              <!-- Purple AI Results Box -->
              <div v-if="showAiBox" class="p-3 mb-3 rounded-4 border border-dashed" style="background-color: #ece9f5; border-color: #b7abdd; color: #4a3d73;">
                <h6 class="fw-bold mb-1" style="color: #5b4b8a;">🔮 AI Optimization Success</h6>
                <p class="small mb-2">Based on your description, we've adjusted the category and applied optimal pricing tags.</p>
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="tag in aiTags" :key="tag" class="badge" style="background-color: #5b4b8a;">#{{ tag }}</span>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-2">
                  <label class="form-label small fw-semibold">Duration</label>
                  <input type="text" class="form-control form-control-sm" v-model="skill.duration" placeholder="Example: 2 Hours">
                </div>
                <div class="col-md-4 mb-2">
                  <label class="form-label small fw-semibold">Credits Required</label>
                  <input type="number" class="form-control form-control-sm" v-model="skill.credits" placeholder="Credits">
                </div>
                <div class="col-md-4 mb-2">
                  <label class="form-label small fw-semibold">Experience Level</label>
                  <select class="form-select form-select-sm" v-model="skill.level">
                    <option value="">Select Level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Availability</label>
                  <select class="form-select form-select-sm" v-model="skill.status">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div class="col-md-6 mb-2">
                  <label class="form-label small fw-semibold">Upload Certificate (Optional)</label>
                  <input type="file" class="form-control form-control-sm">
                </div>
              </div>

              <!-- Centered Buttons -->
              <div class="text-center mt-3">
                <button class="btn btn-secondary btn-sm me-3 fw-semibold" @click="resetForm">Reset</button>
                <button class="btn btn-danger btn-sm fw-semibold" @click="saveSkill">Save Skill</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
};