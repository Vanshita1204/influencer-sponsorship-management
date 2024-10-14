export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: -50px;" >
        <div class="card bg-light align-items-center" style="width: 30rem;">
            <div class="card-body">
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="user-name" class="col-form-label">Username:</label>
                    </div>
                    <div class="col-auto">
                        <input type="text" id="user-name" class="form-control" v-model="inputData.name">
                        <div v-if="errors.name" class="text-danger small">{{ errors.name }}</div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-3">
                    <div class="col-auto">
                        <label for="user-email" class="col-form-label">Email Address: </label>
                    </div>
                    <div class="col-auto">
                        <input type="email" id="user-email" class="form-control" aria-describedby="emailHelpInline" v-model='inputData.email'>
                        <div v-if="errors.email" class="text-danger small">{{ errors.email }}</div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="user-password" class="col-form-label">Password:</label>
                    </div>
                    <div class="col-auto">
                        <input type="password" id="user-password" class="form-control" aria-describedby="passwordHelpInline" v-model='inputData.password'>
                        <div v-if="errors.password" class="text-danger small">{{ errors.password }}</div>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label class="col-form-label">Role:</label>
                    </div>
                    <div class="col-auto">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="role" id="sponsor" value="sponsor" v-model="inputData.role">
                            <label class="form-check-label" for="sponsor">Sponsor</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="role" id="influencer" value="influencer" v-model="inputData.role">
                            <label class="form-check-label" for="influencer">Influencer</label>
                        </div>
                    </div>
                </div>
                <div v-if="inputData.role === 'sponsor'">
                    <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="sponsor-company" class="col-form-label">Company Name:</label>
                        </div>
                        <div class="col-auto">
                            <input type="text" id="sponsor-company" class="form-control" v-model="inputData.companyName">
                            <div v-if="errors.companyName" class="text-danger small">{{ errors.companyName }}</div>
                        </div>
                    </div>
                    <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="sponsor-industry" class="col-form-label">Industry:</label>
                        </div>
                        <div class="col-auto">
                            <input type="text" id="sponsor-industry" class="form-control" v-model="inputData.industry">
                            <div v-if="errors.industry" class="text-danger small">{{ errors.industry }}</div>
                        </div>
                    </div>
                    <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="sponsor-budget" class="col-form-label">Budget:</label>
                        </div>
                        <div class="col-auto">
                            <input type="number" id="sponsor-budget" class="form-control" step="0.01" v-model="inputData.budget">
                            <div v-if="errors.budget" class="text-danger small">{{ errors.budget }}</div>
                        </div>
                    </div>
                </div>
                
                <div v-if="inputData.role === 'influencer'">
                    <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="influencer-handle" class="col-form-label">Social Media Handle:</label>
                        </div>
                        <div class="col-auto">
                            <input type="text" id="influencer-handle" class="form-control" v-model="inputData.handle">
                            <div v-if="errors.handle" class="text-danger small">{{ errors.handle }}</div>
                        </div>
                    </div>
                    <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="influencer-followers" class="col-form-label">Number of Followers:</label>
                        </div>
                        <div class="col-auto">
                            <input type="number" id="influencer-followers" class="form-control" v-model="inputData.followers">
                            <div v-if="errors.followers" class="text-danger small">{{ errors.followers }}</div>

                        </div>
                    </div>
                    <div class="row g-3 align-items-center mb-2">
                        <div class="col-auto">
                            <label for="influencer-niche" class="col-form-label">Niche:</label>
                        </div>
                        <div class="col-auto">
                            <input type="text" id="influencer-niche" class="form-control" v-model="inputData.niche">
                        <div v-if="errors.niche" class="text-danger small">{{ errors.niche }}</div>
                        </div>
                    </div>
                    <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="category" class="col-form-label">Category:</label>
                    </div>
                    <div class="col-auto">
                        <select id="category" class="form-select" v-model="inputData.category">
                            <option value="" disabled>Select a category</option>
                            <option value="1">Nano</option>
                            <option value="2">Mini</option>
                            <option value="3">Micro</option>
                            <option value="4">Macro</option>
                            <option value="5">Mega</option>
                        </select>
                    <div v-if="errors.category" class="text-danger small">{{ errors.category }}</div>

                    </div>
                </div>
                </div>
                <div v-if="error" class="text-danger small mt-2">*{{ error }}</div>
                <div class="row g-3 align-items-center mt-2">
                    <div class="col text-center">
                        <button type="submit" class="btn btn-outline-primary" @click='signup'>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            inputData: {
                name: null,
                email: null,
                password: null,
                role: 'influencer',
                companyName: null,
                budget: null,
                industry: null,
                handle: null,
                followers: null,
                niche: null,
                category: null,
            },
            errors: {},
            error: null,
        }
    },
    methods: {
        validateFields() {
            this.errors = {}
            if (!this.inputData.name) this.errors.name = "Username is required"
            if (!this.inputData.email) this.errors.email = "Email is required"
            if (!this.inputData.password) this.errors.password = "Password is required"
            if (this.inputData.role === 'sponsor') {
                if (!this.inputData.companyName) this.errors.companyName = "Company name is required"
                if (!this.inputData.industry) this.errors.industry = "Industry is required"
                if (!this.inputData.budget) this.errors.budget = "Budget is required"
            }
            if (this.inputData.role === 'influencer') {
                if (!this.inputData.handle) this.errors.handle = "Social media handle is required"
                if (!this.inputData.category) this.errors.category = "Social media category is required"
                if (!this.inputData.followers) this.errors.followers = "Followers is required"
                if (!this.inputData.niche) this.errors.niche = "Niche is required"
            }
            return Object.keys(this.errors).length === 0
        },
        async signup() {
            if (this.validateFields()) {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.inputData),
                })
                const data = await response.json()
                if (response.ok) {
                    this.$router.push({ path: '/login' })
                } else {
                    this.error = data.message
                }
            }
        }
    }
}
