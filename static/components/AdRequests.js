export default {
  template: `
      <div>
        <div v-if="allAdRequests.length > 0">
          <div v-for="(adRequest, index) in allAdRequests" :key="index">
            <div @click="getAdRequest(adRequest)" class="container mb-2 cursor-pointer position-relative">
              <div class="d-flex justify-content-between align-items-center" style="margin-bottom: 0;">
                <div class="d-flex flex-grow-1">
                  <div class="position-absolute" v-if="!adRequest.is_viewed && role !== adRequest.requested_by" style="top: 8px; left: -20px;">
                    <span class="badge bg-danger" style="border-radius: 50%; width: 5px; height: 5px;">.</span>
                  </div>
                  <div class="me-3">
                    <h5 class="mb-1">{{ adRequest.campaign_name }}</h5>
                    <small class="text-body-secondary">
                      {{ adRequest.sponsor_name }}<br>
                      {{ adRequest.influencer_name }} - {{ adRequest.influencer_handle }}
                    </small>
                  </div>
                  <div class="text-center flex-grow-1">
                    <button
                      class="btn btn-outline-warning"
                      v-if="adRequest.status === 'Pending'"
                      disabled
                    >
                      {{ adRequest.status }}
                    </button>
                    <button
                      class="btn btn-outline-success"
                      v-if="adRequest.status === 'Accepted'"
                      disabled
                    >
                      {{ adRequest.status }}
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      v-if="adRequest.status === 'Rejected'"
                      disabled
                    >
                      {{ adRequest.status }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="role !== 'admin' && adRequest.status=='Pending'" class="d-flex justify-content-end" style="margin-top: -80px; margin-bottom: 50px; margin-right:20px;">
              <button class="btn btn-outline-success me-2" v-if="role !== adRequest.requested_by" @click.stop="updateAdRequest(adRequest,'accepted',index)">
                Accept
              </button>
              <button class="btn btn-outline-danger me-2"  v-if="role !== adRequest.requested_by" @click.stop="updateAdRequest(adRequest,'rejected',index)">
                Reject
              </button>
              <button class="btn btn-outline-primary" @click.stop="editAdRequest(adRequest)">
                Edit
              </button>
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
      allAdRequests: [],
      token: localStorage.getItem("authorization-token"),
      role: localStorage.getItem("role"),
      error: null
    };
  },
  async mounted() {
    let query_params = {};
    if (this.influencerId) {
      query_params = { influencer_id: this.influencerId };
    } else if (this.sponsorId) {
      query_params = { sponsor_id: this.sponsorId };
    }
    const queryString = new URLSearchParams(query_params).toString();
    const response = await fetch(`/api/ad-request?${queryString}`, {
      headers: {
        Authorization: this.token
      }
    });

    const data = await response.json();
    if (response.ok) {
      this.allAdRequests = data;
    } else {
      this.error = data.message;
    }
  },
  methods: {
    getAdRequest(adRequest) {
      this.$router.push(`/ad-request/${adRequest.id}`);
    },
    async updateAdRequest(adRequest, status, index) {
      try {
        const response = await fetch(`/api/ad-request/${adRequest.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("authorization-token"),
          },
          body: JSON.stringify({ "status": status }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        this.allAdRequests[index].status = status;
      } catch (error) {
        this.error = error.message;
      }
    },
    editAdRequest(adRequest) {
      this.$router.push(`/ad-request/${adRequest.id}`);
    }
  }
};
