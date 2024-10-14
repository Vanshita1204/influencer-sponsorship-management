export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: -50px;">
        <div class="card bg-light align-items-center" style="width: 30rem;">
            <div class="card-body">
                <!-- Campaign Dropdown -->
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="campaign" class="col-form-label">Campaign:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="role === 'sponsor'">
                            <select id="campaign-id" class="form-select" v-model="inputData.campaign_id">
                                <option disabled value="">Select a campaign</option>
                                <option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">
                                    {{ campaign.name }}
                                </option>
                            </select>
                            <div v-if="errors.campaign_id" class="text-danger small">{{ errors.campaign_id }}</div>
                        </div>
                        <div v-else>
                            <span v-if="campaignName">{{ campaignName }}</span>
                        </div>
                    </div>
                </div>
                <!-- Messages Field -->
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="messages" class="col-form-label">Messages:</label>
                    </div>
                    <div class="col-auto">
                        <textarea class="form-control" id="messages" v-model="inputData.messages" rows="3"></textarea>
                    </div>
                </div>
                <!-- Requirements Field -->
                <div class="row g-3 align-items-center mb-2" v-if="role=='sponsor'">
                    <div class="col-auto">
                        <label for="requirements" class="col-form-label">Requirements:</label>
                    </div>
                    <div class="col-auto">
                        <textarea class="form-control" id="requirements" v-model="inputData.requirements" rows="3"></textarea>
                        <div v-if="errors.requirements" class="text-danger small">{{ errors.requirements }}</div>
                    </div>
                </div>
                <!-- Amount Field -->
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="amount" class="col-form-label">Amount:</label>
                    </div>
                    <div class="col-auto">
                        <input type="number" id="amount" class="form-control" step="0.01" v-model="inputData.amount">
                        <div v-if="errors.amount" class="text-danger small">{{ errors.amount }}</div>
                    </div>
                </div>
                <!-- Submit Button -->
                <div class="row g-3 align-items-center mt-2">
                    <div class="col text-center">
                        <button type="submit" class="btn btn-outline-primary" @click='sendAdRequest'>Send Ad Request</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            campaigns: [],
            inputData: {
                campaign_id: null,
                influencer_id: null,
                amount: null,
                requirements: null,
                messages: null
            },
            campaignName: this.$route.query.campaignName,
            errors: {},
            error: null,
            role: localStorage.getItem("role")
        }
    },
    methods: {
        async fetchAllCampaigns() {
            if (this.role === "sponsor") {
                try {
                    const query_params = { "verified": true };
                    const queryString = new URLSearchParams(query_params).toString();
                    const response = await fetch(`/api/campaign?${queryString}`, {
                        headers: {
                            "Authorization": localStorage.getItem("authorization-token")
                        },
                    });
                    const data = await response.json();
                    if (response.ok) {
                        this.campaigns = data;
                    } else {
                        this.error = data.message;
                    }
                } catch (error) {
                    this.error = 'Failed to fetch campaigns';
                }
            }
        },
        validateFields() {
            this.errors = {}
            if (!this.inputData.campaign_id && this.role === "sponsor") {
                this.errors.campaign_id = "Campaign is required";
            }
            if (!this.inputData.requirements && this.role === "sponsor") {
                this.errors.requirements = "Requirements are required";
            }
            if (!this.inputData.amount) {
                this.errors.amount = "Amount is required";
            }
            return Object.keys(this.errors).length === 0;
        },
        async sendAdRequest() {
            if (this.validateFields()) {
                try {
                    const influencerId = this.$route.query.influencerId;
                    if (influencerId) {
                        this.inputData.influencer_id = influencerId;
                    }
                    const response = await fetch('/api/ad-request', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("authorization-token")
                        },
                        body: JSON.stringify(this.inputData),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        this.$router.push({ path: '/campaigns' });
                    } else {
                        this.error = data.message;
                    }
                } catch (error) {
                    this.error = 'Failed to send ad request';
                }
            }
        },
    },
    mounted() {
        if (this.role === "sponsor") {
            this.fetchAllCampaigns();
        } else {
            const campaignId = this.$route.query.campaignId;
            if (campaignId) {
                this.inputData.campaign_id = campaignId;
            }
        }
    }
}
