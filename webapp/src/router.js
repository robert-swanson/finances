import Vue from "vue";
import Router from "vue-router";

// import Home from "./pages/old/Home.vue";
import AdminDrivers from "./pages/old/AdminDrivers.vue";
import AdminRides from "./pages/old/AdminRides.vue";
import AdminVehicles from "./pages/old/AdminVehicles.vue";
import Driver from "./pages/old/Driver.vue";
import Passenger from "./pages/old/Passenger.vue";

import Dashboard from "./pages/Dashboard.vue";
import Transactions from "./pages/Transactions.vue";
import Budgeting from "./pages/Budgeting.vue";
import Accounts from "./pages/Accounts.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    // { name: "home-page", path: "/", component: Home},
    { name: "admin-vehicles", path: "/admin/vehicles", component: AdminVehicles },
    { name: "admin-rides", path: "/admin/rides", component: AdminRides },
    { name: "admin-drivers", path: "/admin/drivers", component: AdminDrivers },
    { name: "passenger", path: "/passenger", component: Passenger },
    { name: "driver", path: "/driver", component: Driver },

    { name: "dashboard", path: "/", component: Dashboard },
    { name: "dashboard", path: "/dashboard", component: Dashboard },
    { name: "transactions", path: "/transactions", component: Transactions },
    { name: "budgeting", path: "/budgeting", component: Budgeting },
    { name: "accounts", path: "/accounts", component: Accounts },
  ]
});
