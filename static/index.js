import router from './router.js'
import Navbar from './components/Navbar.js'

router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('authorization-token');

    if (to.name !== 'Login' && to.name !== 'SignUp' && !isAuthenticated) {
        next({ name: 'Login' });
    }
    else if (to.name === 'Login' && isAuthenticated) {
        next({ name: 'Home' });
    }
    else {
        next();
    }
});

new Vue({
    el: "#app",
    template:
        `<div>
        <Navbar/>
        <router-view/>
    </div>
    `,
    router,
    components: {
        Navbar,
    }
})