export default {
    template: `
<div>
  <div v-if="allUsers.length > 0">
    <div v-for="(user, index) in allUsers" :key="index">
      <div @click="user.role !== 'admin' ? getUser(user) : null" class="container mb-3 cursor-pointer">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex flex-grow-1">
            <div class="me-3">
              <h5 class="mb-1">{{ user.username }}</h5>
              <small class="text-body-secondary">{{ user.email }}</small>
            </div>
            <div class="text-center flex-grow-1">
              <small class="text-body-secondary">{{ user.role }}</small>
            </div>
            <div class="text-end">
              <button class="btn btn-outline-primary" v-if="!user.active && user.role != 'admin'" @click="activate(user, index)">Activate</button>
              <button class="btn btn-outline-danger" v-else-if="user.active && user.role != 'admin'" @click="deactivate(user, index)">Deactivate</button>
            </div>
          </div>
        </div>
      </div>
      <hr class="my-3 w-100 mx-n3" style="width: 100%; margin: 0;">
    </div>
  </div>
  <div v-else-if="error" class="text-danger">{{ error }}</div>
</div>

    `,
    data() {
        return {
            allUsers: [],
            token: localStorage.getItem("authorization-token"),
            error: null
        }
    },
    async mounted() {
        const response = await fetch('/admin/users', {
            headers: {
                "Authorization": this.token
            }
        });

        const data = await response.json();
        if (response.ok) {
            this.allUsers = data;
        } else {
            this.error = data.message;
        }
    },
    methods: {
        async activate(user, index) {
            const response = await fetch(`/activate/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": this.token
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                this.allUsers[index].active = true;
            } else {
                this.error = data.message;
            }
        },
        async deactivate(user, index) {
            const response = await fetch(`/deactivate/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": this.token
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                this.allUsers[index].active = false;
            } else {
                this.error = data.message;
            }
        },
        async getUser(user) {
            this.$router.push(`/user-dashboard/${user.id}`)
        },
    }
}
