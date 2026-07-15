export default {

  data() {
    return {
      selectedUser: null,
      messageInput: "",
      users: [
        { id: 1, name: "Jignesh Bhai", role: "Resident", online: true, lastSeen: "now" },
        { id: 2, name: "Rahul Shah", role: "Resource Owner", online: true, lastSeen: "now" },
        { id: 3, name: "Priya Patel", role: "Skill Provider", online: false, lastSeen: "2 hours ago" },
        { id: 4, name: "Amit Mehta", role: "Resident", online: true, lastSeen: "now" },
        { id: 5, name: "Admin", role: "Administrator", online: true, lastSeen: "now" }
      ],
      conversations: {
        1: [
          { sender: "Jignesh Bhai", text: "Hi! How are you?", time: "10:30 AM", isSent: false },
          { sender: "You", text: "I'm doing great! How about you?", time: "10:31 AM", isSent: true },
          { sender: "Jignesh Bhai", text: "Great! Want to borrow a projector?", time: "10:32 AM", isSent: false }
        ],
        2: [
          { sender: "Rahul Shah", text: "The camping tent is ready for pickup", time: "09:15 AM", isSent: false },
          { sender: "You", text: "Perfect! I'll come tomorrow", time: "09:16 AM", isSent: true }
        ],
        3: [
          { sender: "Priya Patel", text: "Can you attend the yoga class tomorrow?", time: "Yesterday", isSent: false },
          { sender: "You", text: "Sure! What time?", time: "Yesterday", isSent: true }
        ],
        4: [
          { sender: "Amit Mehta", text: "Thank you for the help!", time: "Yesterday", isSent: false }
        ],
        5: [
          { sender: "Admin", text: "Please update your profile information", time: "3 days ago", isSent: false }
        ]
      }
    };
  },

  computed: {
    currentMessages() {
      if (!this.selectedUser) return [];
      return this.conversations[this.selectedUser.id] || [];
    },
    currentRole() {
      const hash = window.location.hash;
      if (hash.startsWith('#/admin')) return 'admin';
      if (hash.startsWith('#/coord')) return 'coordinator';
      if (hash.startsWith('#/resident')) return 'resident';
      if (hash.startsWith('#/owner')) return 'owner';
      if (hash.startsWith('#/provider')) return 'provider';
      return 'resident'; // fallback
    },
    rolePath() {
      const hash = window.location.hash;
      if (hash.startsWith('#/admin')) return '#/admin';
      if (hash.startsWith('#/coord')) return '#/coord';
      if (hash.startsWith('#/resident')) return '#/resident';
      if (hash.startsWith('#/owner')) return '#/owner';
      if (hash.startsWith('#/provider')) return '#/provider';
      return '#/resident'; // fallback
    }
  },

  methods: {
    selectUser(user) {
      this.selectedUser = user;
      this.messageInput = "";
    },
    sendMessage() {
      if (!this.messageInput.trim() || !this.selectedUser) return;
      
      if (!this.conversations[this.selectedUser.id]) {
        this.conversations[this.selectedUser.id] = [];
      }
      
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      this.conversations[this.selectedUser.id].push({
        sender: "You",
        text: this.messageInput,
        time: time,
        isSent: true
      });
      
      this.messageInput = "";
    }
  },

  template: `
  <div>

    <!-- Navbar -->
    <app-navbar title="Community Portal" :rolePath="rolePath"></app-navbar>
    <app-sidebar :role="currentRole" activePage="Chat"></app-sidebar>

    <!-- Main Content -->
    <div class="container-fluid mt-3" style="height: calc(100vh - 70px);">
      <div class="row h-100">
        
        <!-- Users List -->
        <div class="col-md-3 border-end" style="overflow-y: auto;">
          <div class="sticky-top bg-white p-3">
            <h5 class="fw-bold mb-3">Conversations</h5>
            <input type="text" class="form-control mb-3" placeholder="Search...">
          </div>
          <div class="list-group list-group-flush">
            <button v-for="user in users" :key="user.id" 
                    class="list-group-item list-group-item-action"
                    :class="selectedUser && selectedUser.id === user.id ? 'active' : ''"
                    @click="selectUser(user)">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <h6 class="mb-0 fw-semibold">{{ user.name }}</h6>
                  <small class="text-muted">{{ user.role }}</small>
                </div>
                <span class="badge" :class="user.online ? 'bg-success' : 'bg-secondary'">
                  {{ user.online ? '●' : '○' }}
                </span>
              </div>
              <small v-if="!user.online" class="text-muted d-block">{{ user.lastSeen }}</small>
            </button>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="col-md-9 d-flex flex-column">
          <div v-if="!selectedUser" class="flex-grow-1 d-flex align-items-center justify-content-center">
            <div class="text-center text-muted">
              <h4>Select a conversation to start chatting</h4>
            </div>
          </div>

          <div v-else class="d-flex flex-column h-100">
            <!-- Chat Header -->
            <div class="border-bottom p-3 bg-light">
              <h5 class="mb-0 fw-bold">{{ selectedUser.name }}</h5>
              <small class="text-muted">{{ selectedUser.online ? 'Online' : 'Offline' }}</small>
            </div>

            <!-- Messages -->
            <div class="flex-grow-1 p-3" style="overflow-y: auto; background-color: #f8f9fa;">
              <div v-for="(msg, idx) in currentMessages" :key="idx" class="mb-3">
                <div :class="msg.isSent ? 'text-end' : 'text-start'">
                  <div :class="msg.isSent ? 'bg-primary text-white' : 'bg-white border'" 
                       class="d-inline-block p-3 rounded-3" style="max-width: 70%;">
                    <p class="mb-1">{{ msg.text }}</p>
                    <small class="opacity-75">{{ msg.time }}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="border-top p-3 bg-white">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Type a message..." 
                       v-model="messageInput" @keyup.enter="sendMessage">
                <button class="btn btn-primary" @click="sendMessage">Send</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
  `
};
