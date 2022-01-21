<template>
  <v-app>
    <nav-bar />
    <v-content>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer class="pa-3">
      <v-layout justify-center class="font-weight-thin">
        Personal Finances for the Swanson Family
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
  import NavBar from "./components/NavBar.vue";

  export default {
  name: "App",
  components: {
    NavBar
  }
};
</script>
