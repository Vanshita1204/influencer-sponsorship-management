import Campaigns from "./Campaigns.js";
import AdRequests from "./AdRequests.js";
import Statistics from "./Statistics.js";
export default {
    template: `
     <div class="container mt-4">
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else>
            <div v-if="userData.name" class="row">
                <div class="col-md-6">
                    <p class="h4">{{ userData.name }}</p>
                    <p v-if="role=='admin'">{{ userData.email }}</p>
                    <p>{{ userData.role }}</p>
                </div>
                <div class="col-md-6">
                    <div v-if="userData.role === 'sponsor'">
                        <p>Company Name: {{ userData.company_name }}</p>
                        <p>Budget: {{ userData.budget }}</p>
                        <p>Industry: {{ userData.industry }}</p>
                    </div>
                    <div v-else>
                        <p>Social Media Handle: {{ userData.handle }}</p>
                        <p>Followers: {{ userData.followers }}</p>
                        <p>Category: {{ userData.category }} {{ userData.niche }} influencer</p>
                    </div>
                </div>
            </div>
            <div>
    <ul class="nav nav-tabs row no-gutters mt-4">
      <li class="nav-item col-4">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'campaigns' }"
          @click="setActiveTab('campaigns')"
          href="#">
          Campaigns
        </a>
      </li>
      <li class="nav-item col-4" v-if="role=='admin'">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'adRequests' }"
          @click="setActiveTab('adRequests')"
          href="#">
          Ad Requests
        </a>
      </li>
      <li class="nav-item col-4">
        <a
          class="nav-link"
          :class="{ active: activeTab === 'statistics' }"
          @click="setActiveTab('statistics')"
          href="#">
          Statistics
        </a>
      </li>
    </ul>
    <div class="container" :style="{ marginTop: '2%' }" >

        <Campaigns   v-if="activeTab === 'campaigns'" :sponsorId= "userData.sponsor_id" :influencerId= "userData.influencer_id" />
        <AdRequests  v-if="activeTab === 'adRequests'" :sponsorId= "userData.sponsor_id" :influencerId= "userData.influencer_id" />
        <Statistics  v-if="activeTab === 'statistics'" :sponsorId= "userData.sponsor_id" :influencerId= "userData.influencer_id" />
    </div>
  </div>
        </div>
    </div>
    `,
    data() {
        return {
            userData: {
                name: null,
                email: null,
                role: null,
                company_name: null,
                industry: null,
                budget: null,
                niche: null,
                last_login: null,
                followers: null,
                category: null,
                handle: null,
                sponsor_id: null,
                influencer_id: null
            },
            error: null,
            activeTab: null,
            role: localStorage.getItem("role")
        };
    },
    created() {
        this.fetchUserData();
    },
    methods: {
        async fetchUserData() {
            try {
                const userId = this.$route.params.userId;
                const response = await fetch(`admin/user/${userId}`, {
                    headers: {
                        "Authorization": localStorage.getItem("authorization-token"),
                    },
                });


                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }

                const data = await response.json();
                this.userData = data;
            } catch (error) {
                this.error = error.message;
            }
        },
        setActiveTab(tab) {
            this.activeTab = tab;
        }
    },
    components: {
        Campaigns,
        AdRequests,
        Statistics
    }
};
