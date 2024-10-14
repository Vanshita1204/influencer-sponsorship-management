export default {
    template: `
    <div class="container" style="margin-top: 50px;">
        <div class="row">
            <div class="col-md-4" v-if="source=='platform'">
                <div class="card mb-4" style="border: 1px solid #ccc; border-radius: 5px;">
                    <div class="card-header" style="background-color: #007bff; color: white; padding: 10px; font-weight: bold;">
                        Platform Statistics
                    </div>
                    <div class="card-body" style="padding: 10px;">
                        <ul class="list-group list-group-flush" style="list-style-type: none; padding: 0;">
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Users: {{ platform_statistics.total_users }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Influencers: {{ platform_statistics.total_influencers }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Sponsors: {{ platform_statistics.total_sponsors }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Campaigns: {{ platform_statistics.total_campaigns }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Ad Requests: {{ platform_statistics.total_ad_requests }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Average Campaign Duration: {{ platform_statistics.average_campaign_duration }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Monthly Active Users: {{ platform_statistics.monthly_active_users }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Campaign Verification Rate: {{ platform_statistics.campaign_verification_rate }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Ad Request Acceptance Rate: {{ platform_statistics.ad_request_acceptance_rate }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Growth Rate: {{ platform_statistics.growth_rate }}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-4" v-if="source=='sponsor'">
                <div class="card mb-4" style="border: 1px solid #ccc; border-radius: 5px;">
                    <div class="card-header" style="background-color: #28a745; color: white; padding: 10px; font-weight: bold;">
                        Sponsor Statistics
                    </div>
                    <div class="card-body" style="padding: 10px;">
                        <ul class="list-group list-group-flush" style="list-style-type: none; padding: 0;">
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Accepted Ad Requests: {{ sponsor_statistics.accepted_ad_requests }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Rejected Ad Requests: {{ sponsor_statistics.rejected_ad_requests }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Average Amount Offered: {{ sponsor_statistics.average_amount_offered }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Ad Requests: {{ sponsor_statistics.total_ad_requests_received }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Amount Spent: {{ sponsor_statistics.total_amount_spent }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Budget Utilized: {{ sponsor_statistics.total_budget_utilized }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Campaigns: {{ sponsor_statistics.total_campaigns }}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-4" v-if="source=='influencer'">
                <div class="card mb-4" style="border: 1px solid #ccc; border-radius: 5px;">
                    <div class="card-header" style="background-color: #17a2b8; color: white; padding: 10px; font-weight: bold;">
                        Influencer Statistics
                    </div>
                    <div class="card-body" style="padding: 10px;">
                        <ul class="list-group list-group-flush" style="list-style-type: none; padding: 0;">
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Accepted Ad Requests: {{ influencer_statistics.accepted_ad_requests }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Rejected Ad Requests: {{ influencer_statistics.rejected_ad_requests }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Ad Requests: {{ influencer_statistics.total_ad_requests }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Average Amount Offered: {{ influencer_statistics.average_amount_offered }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Average Amount Requested: {{ influencer_statistics.average_amount_requested }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Campaign Success Rate: {{ influencer_statistics.campaign_success_rate }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Campaigns Interacted With: {{ influencer_statistics.total_campaigns_participated }}</li>
                            <li class="list-group-item" style="border: none; padding: 5px 0;">Total Earnings: {{ influencer_statistics.total_earnings }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
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
            source: null,
            platform_statistics: {
                total_users: null,
                total_influencers: null,
                total_sponsors: null,
                total_campaigns: null,
                total_ad_requests: null,
                average_campaign_duration: null,
                monthly_active_users: null,
                campaign_verification_rate: null,
                ad_request_acceptance_rate: null,
                growth_rate: null
            },
            sponsor_statistics: {
                accepted_ad_requests: null,
                rejected_ad_requests: null,
                average_amount_offered: null,
                total_ad_requests_received: null,
                total_amount_spent: null,
                total_budget_utilized: null,
                total_campaigns: null
            },
            influencer_statistics: {
                accepted_ad_requests: null,
                rejected_ad_requests: null,
                total_ad_requests: null,
                average_amount_offered: null,
                average_amount_requested: null,
                campaign_success_rate: null,
                total_campaigns_participated: null,
                total_earnings: null
            }
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
        const response = await fetch(`/statistics?${queryString}`, {
            headers: {
                "Authorization": localStorage.getItem("authorization-token")
            }
        })
        const data = await response.json()
        if (response.ok) {
            this.source = data['source']
            if (data['source'] == "platform") {
                this.platform_statistics = data['statistics']
            } else if (data['source'] == 'influencer') {
                this.influencer_statistics = data['statistics']
            } else {
                this.sponsor_statistics = data['statistics']
            }
        }
    }
}