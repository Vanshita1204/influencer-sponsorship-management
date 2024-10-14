export default {
  template: `
<div>
    <nav class="navbar navbar-expand-lg bg-body-tertiary mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">InfluencerSponsor</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#" @click="home">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" @click="listCampaigns">Campaigns</a>
            </li>
            <li class="nav-item" v-if="authorization">
              <a class="nav-link" href="#" @click="listAdRequests">AdRequests</a>
            </li>
            <li class="nav-item"v-if='role!="influencer"'>
              <a class="nav-link" href="#" @click="listInfluencers">Influencers</a>
            </li>
            <li class="nav-item" v-if='role=="admin"'>
              <a class="nav-link" href="#" @click="listUsers">Users</a>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto" v-if='authorization'>
           <li class="nav-item text-end" v-if="role === 'sponsor' && this.$route.name === 'Campaigns'">
              <a class="nav-link" href="#" @click="addCampaign" >
                Add Campaign
              </a>
            </li>
            <li class="nav-item text-end" v-if="this.$route.name === 'AdRequests'">
              <a class="nav-link" href="#" @click="downloadCSV" >
                Download CSV
              </a>
            </li>
            <li class="nav-item text-end">
              <a class="nav-link" href="#" @click="logout" >
                Logout
              </a>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto" v-else>
            <li class="nav-item text-end" v-if="this.$route.name === 'SignUp'">
              <a class="nav-link" href="#" @click="login">Login</a>
            </li>
            <li class="nav-item text-end" v-if="this.$route.name === 'Login'">
              <a class="nav-link" href="#" @click="signup">SignUp</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>


    `,
  data() {
    return {
      role: localStorage.getItem("role"),
      isWaiting: true,
      authorization: Boolean(localStorage.getItem("authorization-token"))
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("role")
      localStorage.removeItem("authorization-token")
      this.$router.push("/login")
      this.authorization = false
    },
    listUsers() {
      this.$router.push("/users")
    },
    signup() {
      this.$router.push("/signup")
    },
    login() {
      this.$router.push("/login")
    },
    listCampaigns() {
      this.$router.push("/campaigns")
    },
    home() {
      this.$router.push('/')
    },
    listAdRequests() {
      this.$router.push("/ad-requests")

    },
    addCampaign() {
      this.$router.push("/add-campaign")
    },
    listInfluencers() {
      this.$router.push("/influencers")
    },
    async downloadCSV() {
      this.isWaiting = true
      const res = await fetch('/download-csv', {
        headers: {
          "Authorization": localStorage.getItem("authorization-token")
        }
      })
      const data = await res.json()
      if (res.ok) {
        const taskId = data['task-id']
        const intv = setInterval(async () => {
          const csv_res = await fetch(`/get-csv/${taskId}`,
            {
              headers: {
                "Authorization": localStorage.getItem("authorization-token")
              }
            }
          )
          if (csv_res.ok) {
            this.isWaiting = false
            clearInterval(intv)
            window.location.href = `/get-csv/${taskId}`
            alert("File Downloaded");
          }
        }, 1000)
      }
    }
  }
}