<style scoped>
.selectedRow {
    /* background-color: red; */
    font-weight: bold;
}

</style>
<template>
  <v-container>
    <v-card-text class="display-2 pl-0"> Driver Registration </v-card-text>
    <v-row align="stretch">
      <v-col>
        <v-card-text class="display-1"> Drivers </v-card-text>
        <v-data-table :headers="headersDrivers" :items="drivers" sort-by="id">
          <template v-slot:body="{ items }">
              <tbody>
                <tr v-for="item in items" :key="item.id" @click="selectItem(item)" :class="{'selectedRow': item === selectedDriver}">
                  <td>{{ item.first_name }}</td>
                  <td>{{ item.last_name }}</td>
                </tr>
              </tbody>
          </template>
        </v-data-table>
      </v-col>
      <v-col>
        <v-card-text class="display-1"> Authorized Vehicles </v-card-text>
        <v-data-table :headers="headersVehicles" :items="authorizedVehicles">
          <template v-slot:item.action="{ item }"> 
            <v-icon center color="error" @click="deauthorizeVehicle(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
        <v-card-text class="display-1"> Unauthorized Vehicles </v-card-text>
        <v-data-table :headers="headersVehicles" :items="unauthorizedVehicles">
          <template v-slot:item.action="{ item }"> 
            <v-icon center color="error" @click="authorizeVehicle(item)">mdi-plus</v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "AdminDrivers",
  methods: {
    selectItem (item) {
      this.selectedDriver = item;
      this.selectedDriverIndex = this.drivers.indexOf(this.selectedDriver);
      this.getVehicles();
    },
    getDrivers(){
      this.$axios.get("/driver").then(response => {
        this.selectedDriver = response.data[0];
        this.drivers = response.data;
      })
    },
    getVehicles(){
      this.$axios.get("/vehicle").then(response => {
        this.authorizedVehicles = [];
        this.unauthorizedVehicles = [];

        for(const vehicle of response.data) {
          var authorized = false;
          for(const driver of vehicle.driver){
            if(driver.id == this.selectedDriver.id){
              authorized = true;
              break;
            } 
          }
          if(authorized){
              this.authorizedVehicles.push(vehicle);
          }else{
              this.unauthorizedVehicles.push(vehicle);
          }


        }
      })
    },
    authorizeVehicle(vehicle){
      console.log("Authorizing vehicle: ", vehicle)
      const authItem = {vehicle_id: vehicle.id, driver_id: this.selectedDriver.id};
      this.$axios.post("/authentication", authItem).then(() => {
        this.getVehicles();
      }).catch(err => {
        console.log(err);
      })
    },
    deauthorizeVehicle(vehicle){
      console.log("Deauthorizing vehicle: ", vehicle)
      this.$axios.delete(`/authentication/driver_vehicle/${this.selectedDriver.id}/${vehicle.id}`).then(() => {
        this.getVehicles();
      }).catch(err => {
        console.log(err);
      })
    },
  },
  computed: {
  },
  data: function() {
    return {
      drivers: [],
      selectedDriver: {},
      selectedDriverIndex: 0,

      authorizedVehicles: [],
      unauthorizedVehicles: [],

      headersDrivers: [
        {text: "First Name", align: "left", value: "first_name"},
        {text: "Last Name", value: "last_name"},
        ],
      headersVehicles: [
        {text: "ID", align: "left", value: "id"},
        {text: "Make", value: "vehicle_type.make"},
        {text: "Model", value: "vehicle_type.model"},
        {text: "License Number", value: "license_number"},
        {text: "Action", value: "action"}
        ],
    };
  },
  mounted: function(){
    this.getDrivers();
    this.getVehicles();
  }
};
</script>
