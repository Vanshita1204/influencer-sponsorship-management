export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: -50px;">
        <div v-if="!loaded" class="text-center">
            <span>Loading...</span>
        </div>
        <div v-else class="card bg-light align-items-center" style="width: 30rem;">
            <div class="card-body">
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="adRequest-campaign-name" class="col-form-label">Campaign Name:</label>
                    </div>
                    <div class="col-auto">
                        <span>{{ adRequestData.campaign_name }}</span>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="adRequest-sponsor-name" class="col-form-label">Sponsor Name:</label>
                    </div>
                    <div class="col-auto">
                        <span>{{ adRequestData.sponsor_name }}</span>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="adRequest-influencer-name" class="col-form-label">Influencer Name:</label>
                    </div>
                    <div class="col-auto">
                        <span>{{ adRequestData.influencer_name }} - {{ adRequestData.influencer_handle }}</span>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="requirements" class="col-form-label">Requirements:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.requirements">
                            <span>{{ adRequestData.requirements }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('requirements')" v-if="role == 'sponsor' && adRequestData.status=='Pending'">Edit</button>
                        </div>
                        <div v-else>
                            <textarea class="form-control" id="requirements" v-model="editData.requirements" rows="3"></textarea>
                            <div v-if="errors.requirements" class="text-danger small">{{ errors.requirements }}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('requirements')">Save</button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="messages" class="col-form-label">Messages:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.messages">
                            <span>{{ adRequestData.messages }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('messages')" v-if="(role == 'sponsor' || role == 'influencer') && adRequestData.status=='Pending'">Edit</button>
                        </div>
                        <div v-else>
                            <textarea class="form-control" id="messages" v-model="editData.messages" rows="3"></textarea>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('messages')">Save</button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="amount_offered" class="col-form-label">Amount offered:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.amount_offered">
                            <span>{{ adRequestData.amount_offered }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('amount_offered')" v-if="role == 'sponsor' && adRequestData.status=='Pending'">Edit</button>
                        </div>
                        <div v-else>
                            <input type="number" id="amount_offered" class="form-control" step="0.01" v-model="editData.amount_offered">
                            <div v-if="errors.amount_offered" class="text-danger small">{{ errors.amount_offered }}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('amount_offered')">Save</button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="amount_requested" class="col-form-label">Amount requested:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.amount_requested">
                            <span>{{ adRequestData.amount_requested }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('amount_requested')" v-if="role == 'influencer' && adRequestData.status=='Pending'">Edit</button>
                        </div>
                        <div v-else>
                            <input type="number" id="amount_requested" class="form-control" step="0.01" v-model="editData.amount_requested">
                            <div v-if="errors.amount_requested" class="text-danger small">{{ errors.amount_requested }}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('amount_requested')">Save</button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="final_amount" class="col-form-label">Final Amount:</label>
                    </div>
                    <div class="col-auto">
                        <span>{{ adRequestData.final_amount }}</span>
                    </div>
                </div>
                <div  v-if="role !== adRequestData.requested_by && adRequestData.status=='Pending' && role!='admin'" class="d-flex ">
              <button class="btn btn-outline-success me-2" @click.stop="updateAdRequest('accepted')">
                Accept
              </button>
              <button class="btn btn-outline-danger me-2"  @click.stop="updateAdRequest('rejected')">
                Reject
              </button>
            </div>
            </div>
            <div v-if="error" class="text-danger">{{ error }}</div>
        </div>
    </div>
    `,
    data() {
        return {
            role: localStorage.getItem('role'),
            adRequestData: {},
            loaded: false,
            errors: {},
            error: null,
            editMode: {
                requirements: false,
                messages: false,
                amount_offered: false,
                amount_requested: false,
            },
            editData: {
                messages: null,
                requirements: null,
                amount_offered: null,
                amount_requested: null,
            }
        };
    },
    methods: {
        async fetchAdRequestData() {
            const adRequestId = this.$route.params.adRequestId;
            try {
                const response = await fetch(`/api/ad-request/${adRequestId}`, {
                    headers: {
                        "Authorization": localStorage.getItem("authorization-token"),
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
                const data = await response.json();
                this.adRequestData = { ...data[0] };
                this.editData = { ...data[0] };
                this.loaded = true;
            } catch (error) {
                this.error = error.message;
            }
            if (!this.adRequestData.is_viewed && this.role != this.adRequestData.requested_by) {
                try {
                    const response = await fetch(`/api/ad-request/${adRequestId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("authorization-token"),
                        },
                        body: JSON.stringify({ "is_viewed": true }),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message);
                    }
                } catch (error) {
                    this.error = error.message;
                }
            }
        },
        toggleEdit(field) {
            this.editMode[field] = !this.editMode[field];
            if (!this.editMode[field]) {
                this.errors[field] = null;
            }
        },
        validateFields() {
            this.errors = {};
            if (this.editMode.amount_offered && !this.editData.amount_offered) {
                this.errors.amount_offered = "Amount offered is required";
            }
            if (this.editMode.amount_requested && !this.editData.amount_requested) {
                this.errors.amount_requested = "Amount requested is required";
            }
            return Object.keys(this.errors).length === 0;
        },
        async saveField(field) {
            if (!this.validateFields()) return;

            const adRequestId = this.$route.params.adRequestId;
            try {
                const response = await fetch(`/api/ad-request/${adRequestId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem("authorization-token"),
                    },
                    body: JSON.stringify({ [field]: this.editData[field] }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }

                this.adRequestData[field] = this.editData[field];
                this.toggleEdit(field);
            } catch (error) {
                this.error = error.message;
            }
        },
        async updateAdRequest(status) {
            try {
                const adRequestId = this.$route.params.adRequestId;
                const response = await fetch(`/api/ad-request/${adRequestId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem("authorization-token"),
                    },
                    body: JSON.stringify({ "status": status }),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message);
                }

                this.adRequestData = data;
            } catch (error) {
                this.error = error.message;
            }
        },
    },
    mounted() {
        this.fetchAdRequestData();
    }
}
