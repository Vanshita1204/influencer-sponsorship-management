export default {
  template: `
<div>
  <div v-if="allCampaigns.length > 0">
    <div v-for="(campaign, index) in allCampaigns" :key="index">
      <div @click="getCampaign(campaign)" class="container mb-3 cursor-pointer">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex flex-grow-1">
            <div class="me-3">
              <h5 class="mb-1">{{ campaign.name }}</h5>
              <small class="text-body-secondary">{{ campaign.start_date }} - {{ campaign.end_date }}</small>
            </div>
            <div class="text-center flex-grow-1">  {{ campaign.sponsor_company_name}}
            </div>
            <div class="text-end">
              <button 
                class="btn btn-outline-primary" 
                v-if="!campaign.is_verified && role === 'admin'" 
                @click.stop="verifyCampaign(campaign, index)"
              >
                Verify
              </button>
              <button 
                class="btn btn-outline-danger" 
                v-else-if="campaign.is_verified && role === 'admin'" 
                @click.stop="markInappropriate(campaign, index)"
              >
                Mark Inappropriate
              </button>
              <button 
                class="btn btn-outline-primary" 
                v-else-if="campaign.publically_visible && role === 'influencer'" 
                @click.stop="sendAdRequest(campaign, index)"
              >
                Request to Advertise
              </button>
              <button 
                class="btn btn-outline-primary" 
                v-else-if="role === 'sponsor'  && new Date(campaign.end_date) >= new Date()" 
                @click.stop="editCampaign(campaign, index)"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
        <hr class="my-3 w-100 mx-n3" style="width: 100%; margin: 0;">

    </div>
  </div>
  <div v-if="error" class="text-danger">{{ error }}</div>
</div>

    `,
  props: {
    sponsorId: {
      type: Number,
      required: false
    },
    influencerId: {
      type: Number,
      required: false
    }
  },
  data() {
    return {
      allCampaigns: [],
      token: localStorage.getItem("authorization-token"),
      role: localStorage.getItem("role"),
      error: null,

    }
  },
  async mounted() {
    let query_params = {};
    if (this.influencerId) {
      query_params = { "influencer_id": this.influencerId };
    } else if (this.sponsorId) {
      query_params = { "sponsor_id": this.sponsorId };
    }
    const queryString = new URLSearchParams(query_params).toString();
    const response = await fetch(`/api/campaign?${queryString}`, {
      headers: {
        "Authorization": this.token
      },
      query_params: query_params
    });
    const data = await response.json();
    if (response.ok) {
      this.allCampaigns = data;
      this.allCampaigns = data.map(campaign => ({
        ...campaign,
        'sponsor_company_name': campaign['sponsor.company_name'],
      }));

    } else {
      this.error = data.message;
    }
  },
  methods: {
    async verifyCampaign(campaign, index) {
      const response = await fetch(`/verify/campaign/${campaign.id}`, {
        method: 'PUT',
        headers: {
          "Authorization": this.token
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        this.allCampaigns[index].is_verified = true;
      } else {
        this.error = data.message;
      }
    },
    async markInappropriate(campiagn, index) {
      const response = await fetch(`/un-verify/campaign/${campiagn.id}`, {
        method: 'PUT',
        headers: {
          "Authorization": this.token
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        this.allCampaigns[index].is_verified = false;
      } else {
        this.error = data.message;
      }
    },
    async getCampaign(campaign) {
      this.$router.push(`/campaign/${campaign.id}`)
    },
    async editCampaign(campaign, index) {
      this.$router.push(`/campaign/${campaign.id}`)
    },
    async sendAdRequest(campaign, index) {
      const response = await fetch('/api/ad-request',
        {
          headers: {
            "Authorization": this.token
          }
        }
      )
      const data = await response.json()
      if (response.ok) {

        const existingRequest = data.find(element =>
          element.campaign_id === campaign.id && element.status !== 'Rejected'
        );

        if (existingRequest) {
          this.error = 'You already have an active ad request for this campaign';
          return;
        }
      } else {
        this.error = data.message;
        return;
      }

      // Proceed to route if no error
      this.$router.push({
        path: '/send-ad-request',
        query: { campaignId: campaign.id, campaignName: campaign.name }
      });
    }

  }
}
