export default {
  template: `
<div>
  <div class="row mb-4">
    <div class="col-md-4">
      <input type="text" class="form-control" v-model="searchQuery" placeholder="Search by niche or category">
    </div>
  </div>
  <div v-if="filteredInfluencers.length > 0">
    <div v-for="(user, index) in filteredInfluencers" :key="index">
      <div @click="user.role !== 'admin' ? getUser(user) : null" class="container mb-3 cursor-pointer">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex flex-grow-1">
            <div class="me-3">
              <h5 class="mb-1">{{ user.name }}</h5>
              <small class="text-body-secondary">{{ user.handle }}</small>
            </div>
            <div class="text-center flex-grow-1">
              <small class="text-body-secondary">{{ user.category }} {{ user.niche }} influencer</small>
            </div>
            <div class="text-end" v-if="role=='sponsor'">
              <button class="btn btn-outline-primary" @click.stop="sendRequest(user)">Send Ad Request</button>
            </div>
          </div>
        </div>
      </div>
      <hr class="my-3 w-100 mx-n3" style="width: 100%; margin: 0;">
    </div>
  </div>
  <div v-else>
    <p>No influencers match your search criteria.</p>
  </div>
</div>
  `,
  data() {
    return {
      allInfluencers: [],
      searchQuery: '',
      token: localStorage.getItem("authorization-token"),
      role: localStorage.getItem("role"),
      error: null
    }
  },
  async mounted() {
    const response = await fetch('/influencers', {
      headers: {
        "Authorization": this.token
      }
    });

    const data = await response.json();
    if (response.ok) {
      this.allInfluencers = data;
    } else {
      this.error = data.message;
    }
  },
  methods: {
    async getUser(user) {
      this.$router.push(`/user-dashboard/${user.user_id}`)
    },
    async sendRequest(user) {
      this.$router.push({
        path: '/send-ad-request',
        query: { influencerId: user.id }
      });
    }
  },
  computed: {
    filteredInfluencers() {
      if (!this.searchQuery) return this.allInfluencers;
      const lowerQuery = this.searchQuery.toLowerCase();

      return this.allInfluencers.filter(user => {
        const niche = user.niche ? user.niche.toLowerCase() : '';
        const category = user.category ? user.category.toLowerCase() : '';

        return niche.includes(lowerQuery) || category.includes(lowerQuery);
      });
    }
  }

}
