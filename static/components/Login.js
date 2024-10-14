export default {
    template:
        `
    <div class="d-flex justify-content-center align-items-center vh-100" style="margin-top: -150px;">
        <div class="card bg-light" style="width: 25rem;">
            <div class="card-body">
                <div class="row g-3 align-items-center mb-3">
                    <div class="col-auto">
                        <label for="user-email" class="col-form-label">Email Address: </label>
                    </div>
                    <div class="col-auto">
                        <input type="email" id="user-email" class="form-control" aria-describedby="emailHelpInline" v-model='cred.email'>
                    </div>
                </div>
                <div class="row g-3 align-items-center mb-2">
                    <div class="col-auto">
                        <label for="user-password" class="col-form-label">Password:</label>
                    </div>
                    <div class="col-auto">
                        <input type="password" id="user-password" class="form-control" aria-describedby="passwordHelpInline" v-model='cred.password'>
                    </div>
                </div>
                <div v-if="error" class="text-danger small mt-2">*{{ error }}</div>
                <div class="row g-3 align-items-center mt-2">
                    <div class="col text-center">
                        <button type="submit" class="btn btn-outline-primary" @click='login'>Sign In</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            cred: {
                email: null,
                password: null,
            },
            error: null,
        }
    },
    methods: {
        async login() {
            const response = await fetch('/user-login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify(this.cred),
                })
            const data = await response.json()
            if (response.ok) {
                localStorage.setItem('authorization-token', data.token)
                localStorage.setItem('role', data.role)
                this.$router.push({ path: '/' })
            }
            else {
                this.error = data.message
            }
        }
    }
}