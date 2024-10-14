import AdminHome from "./AdminHome.js";
import InfluencerHome from "./InfluencerHome.js";
import SponsorHome from "./SponsorHome.js";
import Statistics from "./Statistics.js";

export default {
    template: `
    <div>
        <AdminHome v-if="userRole === 'admin'" />
        <InfluencerHome v-if="userRole === 'influencer'" />
        <SponsorHome v-if="userRole === 'sponsor'" />
        <Statistics/>
    </div>`,

    data() {
        return {
            userRole: localStorage.getItem('role')
        };
    },
    components: {
        AdminHome,
        InfluencerHome,
        SponsorHome,
        Statistics
    },
};
