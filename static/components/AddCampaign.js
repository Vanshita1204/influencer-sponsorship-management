export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: -50px;" >
        <div class="card bg-light align-items-center" style="width: 30rem;">
            <div class="card-body">
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="campaign-name" class="col-form-label">Campaign Name:</label>
                    </div>
                    <div class="col-auto">
                        <input type="text" id="campaign-name" class="form-control" v-model="inputData.name">
                        <div v-if="errors.name" class="text-danger small">{{ errors.name }}</div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="goals" class="col-form-label">Goals: </label>
                    </div>
                    <div class="col-auto">
                        <textarea class="form-control" id="goals" v-model="inputData.goals" rows="3"></textarea>
                        <div v-if="errors.goals" class="text-danger small">{{ errors.goals }}</div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="description" class="col-form-label">Description: </label>
                    </div>
                    <div class="col-auto">
                        <textarea class="form-control" id="description" v-model="inputData.description" rows="3"></textarea>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="budget" class="col-form-label">Budget:</label>
                        </div>
                        <div class="col-auto">
                            <input type="number" id="budget" class="form-control" step="0.01" v-model="inputData.budget">
                            <div v-if="errors.budget" class="text-danger small">{{ errors.budget }}</div>
                        </div>
                </div>
                <div>
                    <div class="form-check form-switch" v-if="!inputData.publically_visible" @click="setPublicallyVisible(true)">
                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">Publically Invisible</label>
                </div>
                <div class="form-check form-switch" v-else @click="setPublicallyVisible(false)">
                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked>
                    <label class="form-check-label" for="flexSwitchCheckChecked">Publically Visible</label>
                </div>
                <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="start_date" class="col-form-label">Start Date:</label>
                        </div>
                        <div class="col-auto">
                            <input type="date" id="start_date" class="form-control" v-model="inputData.start_date">
                            <div v-if="errors.start_date" class="text-danger small">{{ errors.start_date }}</div>
                        </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="end_date" class="col-form-label">End Date:</label>
                        </div>
                        <div class="col-auto">
                            <input type="date" id="end_date" class="form-control" v-model="inputData.end_date">
                            <div v-if="errors.end_date" class="text-danger small">{{ errors.end_date }}</div>
                        </div>
                </div>
                <div class="row g-3 align-items-center mt-2">
                    <div class="col text-center">
                        <button type="submit" class="btn btn-primary" @click='createCampaign'>Add Campaign</button>
                    </div>
                </div>
            </div>
                </div>
            <div v-if="error" class="text-danger">{{ error }}</div>

                </div>
            
            </div>

        </div>
    </div>
    `,
    data() {
        return {
            inputData: {
                name: null,
                publically_visible: false,
                budget: null,
                start_date: null,
                end_date: null,
                description: null,
                goals: null
            },
            errors: {},
            error: null,
        }
    },
    methods: {
        validateFields() {
            this.errors = {}
            if (!this.inputData.name) this.errors.name = "Campaign Name is required"
            if (!this.inputData.goals) this.errors.goals = "Goals are required"
            if (!this.inputData.budget) this.errors.budget = "Budget is required"
            if (!this.inputData.start_date) this.errors.start_date = "Start Date is required"
            if (!this.inputData.end_date) this.errors.end_date = "End Date is required"
            return Object.keys(this.errors).length === 0
        },
        async createCampaign() {
            if (this.validateFields()) {
                console.log(this.inputData)
                const response = await fetch('/api/campaign', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem("authorization-token")
                    },
                    body: JSON.stringify(this.inputData),
                })
                const data = await response.json()
                if (response.ok) {
                    this.$router.push({ path: '/campaigns' })
                } else {
                    this.error = data.message
                }
            }
        },
        async setPublicallyVisible(value) {
            this.inputData.publically_visible = value
        }
    }
}
