export default {

  data() {
    return {
      searchQuery: "",
      isSearching: false,
      aiTags: [],
      skills: [], // Will be populated by the backend
      isLoading: true
    };
  },

async mounted() {
    try {
      // 1. Try to fetch from the real backend first
      const response = await axios.get("http://localhost:5000/api/skills");
      this.skills = response.data;
    } catch (error) {
      console.warn("Backend not live yet. Loading frontend fallback data.");
      
      // 2. Fallback data so your UI doesn't look broken while waiting for the backend team
      this.skills = [
        { id: 1, title: "Yoga Classes", provider: "Priya Patel", category: "Health & Fitness", credits: 15 },
        { id: 2, title: "Guitar Lessons", provider: "Rahul Shah", category: "Music", credits: 20 },
        { id: 3, title: "Python Programming", provider: "Amit Mehta", category: "Technology", credits: 25 },
        { id: 4, title: "Cooking Workshop", provider: "Neha Joshi", category: "Cooking", credits: 10 }
      ];
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async triggerAiSearch() {
      if (!this.searchQuery.trim()) {
        // If search is empty, just reload the standard list
        this.aiTags = [];
        this.mounted(); 
        return;
      }

      this.isSearching = true;
      this.aiTags = [];

      try {
        // Backend AI semantic search endpoint
        const response = await axios.post("http://localhost:5000/api/ai/semantic-search", {
          query: this.searchQuery
        });

        this.aiTags = response.data.understood_tags;
        this.skills = response.data.results;
      } catch (error) {
        alert("AI Search failed. Please check backend connection.");
        console.error(error);
      } finally {
        this.isSearching = false;
      }
    },

    async bookSkill(skill) {
      // Backend integration for booking a session
      try {
        await axios.post("http://localhost:5000/api/bookings/create", {
          skill_id: skill.id
        });
        alert("Successfully booked '" + skill.title + "' with " + skill.provider + ".");
        window.location.hash = "#/resident/wallet"; // Redirect to wallet or bookings
      } catch (error) {
        alert("Failed to book session. You might not have enough credits.");
        console.error(error);
      }
    }
  },

  template: `
  <div>

    <app-navbar title="Resident Portal" rolePath="#/resident"></app-navbar>
    <app-sidebar role="resident" activePage="Skills"></app-sidebar>

    <div class="container mt-4">
      <h2 class="fw-bold mb-4">Skill Exchange Marketplace</h2>

      <div class="row mb-3">
        <div class="col-md-8 col-lg-6">
          <div class="input-group shadow-sm rounded-4">
            <input type="text" class="form-control" placeholder='Search "someone to fix my tap"...' v-model="searchQuery" @keyup.enter="triggerAiSearch">
            <button class="btn text-white fw-semibold px-4" style="background-color: #5b4b8a;" @click="triggerAiSearch" :disabled="isSearching">
              <span v-if="isSearching" class="spinner-border spinner-border-sm me-1"></span>
              {{ isSearching ? 'Searching...' : 'AI Match' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="aiTags.length > 0" class="row mb-4">
        <div class="col-md-8 col-lg-6">
          <div class="p-3 rounded-4" style="background-color: #ece9f5; color: #4a3d73;">
            <small class="fw-bold d-block mb-2" style="color: #5b4b8a;">⚡ AI Semantic Understanding:</small>
            <span v-for="tag in aiTags" :key="tag" class="badge bg-light text-dark border me-2 py-1 px-2">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="skill in skills" :key="skill.id">
          <div class="card shadow-sm h-100 rounded-4 border-0" style="border: 1px solid #e9ebe6 !important;">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h4 class="fw-semibold text-success mb-0">{{ skill.title }}</h4>
                <span v-if="skill.match_score" class="badge rounded-pill" style="background-color: #e2efe9; color: #2f6f5b; border: 1px solid #a9d3c4;">
                  {{ skill.match_score }}% Match
                </span>
              </div>
              <p class="mb-1 mt-2 text-muted small"><strong>Provider:</strong> {{ skill.provider }}</p>
              <p class="mb-1 text-muted small"><strong>Category:</strong> {{ skill.category }}</p>
              <h5 class="mt-3 mb-0">{{ skill.credits }} <small class="text-muted fs-6">Credits</small></h5>
            </div>
            <div class="card-footer bg-white border-0 text-center pb-3">
              <button class="btn btn-success fw-semibold w-100 rounded-3" @click="bookSkill(skill)">
                Book Session
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="skills.length === 0 && !isSearching" class="col-12 text-center py-5 text-muted">
          <h3 class="mb-3">🏜️</h3>
          <h5>No skills found</h5>
          <p>Try adjusting your AI search criteria.</p>
        </div>
      </div>
    </div>

  </div>
  `
};