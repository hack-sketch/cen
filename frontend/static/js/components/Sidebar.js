export default {
  props: ['role', 'activePage'],
  
  computed: {
    rolePrefix() {
      return this.role === 'coordinator' ? 'coord' : this.role;
    }
  },

  methods: {
    getLinkClass(pageName) {
      const baseClass = "list-group-item list-group-item-action d-flex align-items-center gap-2";
      return this.activePage === pageName 
        ? baseClass + " active-link fw-bold" 
        : baseClass + " inactive-link text-dark";
    }
  },

  template: `
    <component :is="'style'">
      #mainSidebar { 
        width: 270px; 
        background-color: #fdfdfd; 
        border-right: 1px solid #e9ecef !important; 
      }
      #mainSidebar .offcanvas-body::-webkit-scrollbar { width: 8px; }
      #mainSidebar .offcanvas-body::-webkit-scrollbar-thumb { background-color: #ced4da; border-radius: 10px; }
      
      #mainSidebar .list-group-item { 
        font-size: 1rem; 
        padding: 12px 16px 12px 24px; 
        background: transparent; 
        transition: all 0.2s ease-in-out; 
        border: none;
        border-left: 4px solid transparent;
      }
      #mainSidebar .active-link { 
        background-color: #e6f0ff !important; 
        border-left: 4px solid #0d6efd; 
        color: #0d6efd !important; 
      }
      #mainSidebar .inactive-link:hover { 
        background-color: #f8f9fa; 
        color: #000 !important; 
      }
      
      .sidebar-heading { 
        font-size: 0.85rem; 
        font-weight: 700; 
        letter-spacing: 0.05em; 
        color: #6c757d; 
        text-transform: uppercase; 
        margin: 1.5rem 0 0.75rem 24px; 
      }
    </component>

    <div class="offcanvas offcanvas-start shadow-sm" tabindex="-1" id="mainSidebar">
      
      <div class="offcanvas-header py-4 px-4 border-bottom">
        <h5 class="offcanvas-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          🌐 CEN Network
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>

      <div class="offcanvas-body p-0 pb-4">
        <div class="list-group list-group-flush pe-2">
          
          <div class="sidebar-heading">Main Menu</div>

          <!-- ADMIN: The President (High-level Management) -->
          <template v-if="role === 'admin'">
            <a href="#/admin" :class="getLinkClass('Dashboard')">🏠 President Overview</a>
            <a href="#/admin/residents" :class="getLinkClass('Residents')">👥 User Management</a>
            <a href="#/admin/analytics" :class="getLinkClass('Analytics')">📈 System Analytics</a>
            <a href="#/admin/reports" :class="getLinkClass('Reports')">📊 Financial Reports</a>
            <a href="#/admin/settings" :class="getLinkClass('Settings')">⚙️ Global Settings</a>
          </template>

          <!-- COORDINATOR: Operations (Daily Approvals & Management) -->
          <template v-if="role === 'coordinator'">
            <a href="#/coord" :class="getLinkClass('Dashboard')">🏠 Operations Desk</a>
            <a href="#/coord/events" :class="getLinkClass('Events')">📅 Event Approvals</a>
            <a href="#/coord/skills" :class="getLinkClass('Skills')">🛠️ Skill Approvals</a>
            <a href="#/coord/resources" :class="getLinkClass('Resources')">📦 Resource Queue</a>
            <a href="#/coord/volunteers" :class="getLinkClass('Volunteers')">🤝 Volunteer Drives</a>
          </template>

          <!-- RESIDENT -->
          <template v-if="role === 'resident'">
            <a href="#/resident" :class="getLinkClass('Dashboard')">🏠 Dashboard</a>
            <a href="#/resident/events" :class="getLinkClass('Events')">📅 Events Calendar</a>
            <a href="#/resident/propose-event" :class="getLinkClass('Propose Event')">➕ Propose Event</a>
            <a href="#/resident/resources" :class="getLinkClass('Resources')">📦 Resources</a>
            <a href="#/resident/volunteers" :class="getLinkClass('Volunteers')">🤝 Volunteers</a>
            <a href="#/resident/skills" :class="getLinkClass('Skills')">🛠️ Skill Exchange</a>
            <a href="#/resident/wallet" :class="getLinkClass('Wallet')">💳 Credit Wallet</a>
            <a href="#/resident/profile" :class="getLinkClass('Profile')">👤 Profile</a>
          </template>

          <!-- SKILL PROVIDER -->
          <template v-if="role === 'provider'">
            <a href="#/provider" :class="getLinkClass('Dashboard')">🏠 Dashboard</a>
            <a href="#/provider/skills" :class="getLinkClass('My Skills')">🛠️ My Skills</a>
            <a href="#/provider/add-skill" :class="getLinkClass('Add Skill')">➕ Add Skill</a>
            <a href="#/provider/bookings" :class="getLinkClass('Bookings')">📅 Bookings</a>
            <a href="#/provider/history" :class="getLinkClass('History')">📚 Teaching History</a>
          </template>

          <!-- RESOURCE OWNER -->
          <template v-if="role === 'owner'">
            <a href="#/owner" :class="getLinkClass('Dashboard')">🏠 Dashboard</a>
            <a href="#/owner/resources" :class="getLinkClass('My Resources')">📦 My Resources</a>
            <a href="#/owner/add-resource" :class="getLinkClass('Add Resource')">➕ Add Resource</a>
            <a href="#/owner/requests" :class="getLinkClass('Borrow Requests')">📥 Borrow Requests</a>
            <a href="#/owner/history" :class="getLinkClass('History')">📜 Resource History</a>
          </template>

          <!-- SHARED COMMUNITY TOOLS -->
          <div class="sidebar-heading">Community</div>
          <a :href="'#/' + rolePrefix + '/notice-board'" :class="getLinkClass('Notice Board')">📋 Notice Board</a>
          <a :href="'#/' + rolePrefix + '/chat'" :class="getLinkClass('Chat')">💬 Chat Messages</a>
          <a :href="'#/' + rolePrefix + '/complaints'" :class="getLinkClass('Complaints')">🚨 Complaints / Disputes</a>
          
        </div>
      </div>
    </div>
  `
};