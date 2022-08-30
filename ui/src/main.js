import Vue from "vue";
// import vuetify from "./plugins/vuetify";
import vuetify from "./plugins/vuetify";
import router from "./router";
import axios from "axios";
import App from "./App.vue";
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'


const axiosClient = axios.create({
  baseURL: "http://localhost:3000"
});

Vue.prototype.$axios = axiosClient;

const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: 'http://localhost:4000'
})
Vue.use(VueApollo)
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

new Vue({
  el: "#app",
  data: {
    currentUser: null
  },
  router,
  vuetify,
  apolloProvider,
  render: h => h(App),
});
