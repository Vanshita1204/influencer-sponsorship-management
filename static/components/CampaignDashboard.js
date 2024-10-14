export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: -50px;">
        <div v-if="!loaded" class="text-center">
            <span>Loading...</span>
        </div>
        <div v-else class="card bg-light align-items-center" style="width: 30rem;">
            <div class="card-body">
                <!-- Campaign Name Field -->
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="campaign-name" class="col-form-label">Campaign Name:</label>
                    </div>
                    <div class="col-auto">
                        <span>{{ campaignData.name }}</span>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="goals" class="col-form-label">Goals:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.goals">
                            <span>{{ campaignData.goals }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('goals')" v-if="role=='sponsor' && new Date(campaignData.start_date) > new Date()">Edit</button>
                        </div>
                        <div v-else>
                            <textarea class="form-control" id="goals" v-model="editData.goals" rows="3"></textarea>
                            <div v-if="errors.goals" class="text-danger small">{{ errors.goals }}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('goals')">Save</button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="description" class="col-form-label">Description:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.description">
                            <span>{{ campaignData.description }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('description')" v-if="role=='sponsor' && new Date(campaignData.start_date) > new Date()">Edit</button>
                        </div>
                        <div v-else>
                            <textarea class="form-control" id="description" v-model="editData.description" rows="3"></textarea>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('description')">Save</button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="budget" class="col-form-label">Budget:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.budget">
                            <span>{{ campaignData.budget }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('budget')" v-if="role=='sponsor' && new Date(campaignData.start_date) > new Date()">Edit</button>
                        </div>
                        <div v-else>
                            <input type="number" id="budget" class="form-control" step="0.01" v-model="editData.budget">
                            <div v-if="errors.budget" class="text-danger small">{{ errors.budget }}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('budget')">Save</button>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="form-check form-switch" v-if="!editMode.publically_visible">
                        <span>{{ campaignData.publically_visible ? 'Publically Visible' : 'Publically Invisible' }}</span>
                        <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('publically_visible')" v-if="role=='sponsor' && new Date(campaignData.start_date) > new Date()">Edit</button>
                    </div>
                    <div v-else>
                        <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" v-model="editData.publically_visible">
                        <label class="form-check-label" for="flexSwitchCheckDefault">
                            {{ editData.publically_visible ? 'Publically Visible' : 'Publically Invisible' }}
                        </label>
                        <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('publically_visible')">Save</button>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="start_date" class="col-form-label">Start Date:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.start_date">
                            <span>{{ campaignData.start_date }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('start_date')" v-if="role=='sponsor' && new Date(campaignData.start_date) > new Date()">Edit</button>
                        </div>
                        <div v-else>
                            <input type="date" id="start_date" class="form-control" v-model="editData.start_date">
                            <div v-if="errors.start_date" class="text-danger small">{{ errors.start_date }}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('start_date')">Save</button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="end_date" class="col-form-label">End Date:</label>
                    </div>
                    <div class="col-auto">
                        <div v-if="!editMode.end_date">
                            <span>{{ campaignData.end_date }}</span>
                            <button class="btn btn-sm btn-outline-secondary" @click="toggleEdit('end_date')" v-if="role=='sponsor' && new Date(campaignData.start_date) > new Date()">Edit</button>
                        </div>
                        <div v-else>
                            <input type="date" id="end_date" class="form-control" v-model="editData.end_date">
                            <div v-if="errors.end_date" class="text-danger small">{{ errors.end_date }}</div>
                            <button class="btn btn-sm btn-outline-primary mt-1" @click="saveField('end_date')">Save</button>
                        </div>
                    </div>
                </div>
                <div v-if="error" class="text-danger">{{ error }}</div>
              
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            role: localStorage.getItem('role'),
            campaignData: {},
            loaded: false,
            errors: {},
            error: null,
            editMode: {
                goals: false,
                description: false,
                budget: false,
                start_date: false,
                end_date: false,
                name: false,
                publically_visible: false
            },
            editData: {}
        }
    },
    methods: {
        async fetchCampaignData() {
            try {
                const campaignId = this.$route.params.campaignId;
                const response = await fetch(`/api/campaign/${campaignId}`, {
                    headers: {
                        "Authorization": localStorage.getItem("authorization-token"),
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
                const data = await response.json();
                this.campaignData = { ...data[0] };
                this.editData = { ...data[0] };
                this.loaded = true
                this.error = null
            } catch (error) {
                this.error = error.message;
            }
        },
        toggleEdit(field) {
            this.editMode[field] = !this.editMode[field];
            if (!this.editMode[field]) {
                this.validateFields();
            }
        },
        validateFields() {
            this.errors = {};
            if (!this.editData.goals) this.errors.goals = "Goals are required";
            if (!this.editData.budget) this.errors.budget = "Budget is required";
            if (!this.editData.start_date) this.errors.start_date = "Start Date is required";
            if (!this.editData.end_date) this.errors.end_date = "End Date is required";
            return Object.keys(this.errors).length === 0;
        },
        async saveField(field) {
            if (this.validateFields()) {
                const campaignId = this.$route.params.campaignId;
                try {
                    const response = await fetch(`/api/campaign/${campaignId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("authorization-token")
                        },
                        body: JSON.stringify({ [field]: this.editData[field] }),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message);
                    }

                    this.campaignData[field] = this.editData[field];
                    this.toggleEdit(field);
                } catch (error) {
                    this.error = error.message;
                }
            }
        },
    },
    mounted() {
        this.fetchCampaignData();
    }
}
