import Home from './components/Home.js'
import Login from './components/Login.js'
import Users from './components/Users.js'
import SignUp from './components/SignUp.js'
import UserDashboard from './components/UserDashboard.js'
import Campaigns from './components/Campaigns.js'
import AdRequests from './components/AdRequests.js'
import AddCampaign from './components/AddCampaign.js'
import CampaignDashboard from './components/CampaignDashboard.js'
import Influencers from './components/Influencers.js'
import SendAdRequest from './components/SendAdRequest.js'
import AdRequestDashboard from './components/AdRequestDashboard.js'
import Statistics from './components/Statistics.js'
const routes = [
    { path: '/', component: Home, name: 'Home' },
    { path: '/signup', component: SignUp, name: 'SignUp' },
    { path: '/login', component: Login, name: 'Login' },
    { path: '/users', component: Users, name: 'Users' },
    { path: `/user-dashboard/:userId`, component: UserDashboard, name: 'UserDashboard' },
    { path: '/campaigns', component: Campaigns, name: 'Campaigns' },
    { path: '/add-campaign', component: AddCampaign, name: 'AddCampaign' },
    { path: `/campaign/:campaignId`, component: CampaignDashboard, name: 'CampaignDashbaord' },
    { path: '/ad-requests', component: AdRequests, name: 'AdRequests' },
    { path: `/ad-request/:adRequestId`, component: AdRequestDashboard, name: 'AdRequestDashboard' },
    { path: '/send-ad-request', component: SendAdRequest, name: 'SendAdRequests' },
    { path: '/influencers', component: Influencers, name: 'Influencers' },
    { path: '/statistics', component: Statistics, name: 'Statistics' }
]

export default new VueRouter({
    routes,
})