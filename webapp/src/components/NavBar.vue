<template>
  <v-app-bar app dark color="primary">
    <router-link v-bind:to="{ name: 'dashboard' }">
      <v-toolbar-title class="white--text">
        Financial Dashboard
      </v-toolbar-title>
    </router-link>

    <v-spacer></v-spacer>
    <v-btn text v-bind:to="{ name: 'transactions' }">Transactions</v-btn>
    <v-btn text v-bind:to="{ name: 'budgeting' }">Budgeting</v-btn>
    <v-btn text v-bind:to="{ name: 'accounts' }">Accounts</v-btn>

    <v-spacer></v-spacer>

    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on">
          <span>Old</span>
          <v-icon dark>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-btn text v-bind:to="{ name: 'passenger' }">Passenger</v-btn>
        <v-btn text v-bind:to="{ name: 'driver' }">Driver</v-btn>
        <v-list-item v-bind:to="{ name: 'admin-rides' }">
          <v-list-item-title>Rides</v-list-item-title>
        </v-list-item>
        <v-list-item v-bind:to="{ name: 'admin-vehicles' }">
          <v-list-item-title>Vehicles</v-list-item-title>
        </v-list-item>
        <v-list-item v-bind:to="{ name: 'admin-drivers' }">
          <v-list-item-title>Drivers</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

  </v-app-bar>
</template>
