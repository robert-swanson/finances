<style scoped>
.selectedRow {
    font-weight: bold;
}

</style>
<template>
  <v-container>
    <v-card-text class="display-2 pl-0"> Rides </v-card-text>
    <v-btn class="primary" @click="addRide">
      Add Ride
    </v-btn>
    <v-row align="stretch">
      <v-col>
        <v-data-table :headers="headers" :items="rides" sort-by="id">
          <template v-slot:body="{ items }">
              <tbody>
                <tr v-for="item in items" :key="item.id" @click="selectItem(item)" :class="{'selectedRow': item === selectedRide}">
                  <td>{{ item.from_location.name }}</td>
                  <td>{{ item.to_location.name }}</td>
                  <td>{{ formattedDate(item) }}</td>
                </tr>
              </tbody>
          </template>
        </v-data-table>
      </v-col>
      <v-col>
        <v-card class="pa-4">
          <v-card-text class="display-1">
            Ride Information
          </v-card-text>

          <v-row align="center">
            <v-col :cols="4">
              <v-card-text>
                From
              </v-card-text>
            </v-col>
            <v-col>
              <v-combobox v-model="selectedFromLocationName" :items="all_location_names" :disabled="!selectedRide">
              </v-combobox>
            </v-col>
          </v-row>


          <v-row align="center">
            <v-col :cols="4">
              <v-card-text>
                To
              </v-card-text>
            </v-col>
            <v-col>
              <v-combobox v-model="selectedToLocationName" :items="all_location_names" :disabled="!selectedRide">
              </v-combobox>
            </v-col>
          </v-row>

          <v-row align="end">
            <v-dialog v-model="showAddRideDialog" width="500">
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" text class="ml-4">
                  Add Location
                </v-btn>
              </template>

              <v-card class="pa-4">
                <v-card-title>
                  Add New Location
                </v-card-title>
                <v-container>
                  <v-row v-for="prop in location_props" :key="prop[0]">
                    <v-col :cols="4">
                      <v-card-text>
                        {{prop[0]}}
                      </v-card-text>
                    </v-col>
                    <v-col>
                      <v-text-field v-model="prop[2]" solo :placeholder="prop[1]">
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col align="center">
                      <v-btn class="primary" :disabled="!valuesSet" @click="addLocation">
                        Add
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-dialog>
          </v-row> 

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Driver
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="driver" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Date
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="date" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Time
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="time" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Distance
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="distance" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Fuel
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="fuelPrice" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Fee
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="fee" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Vehicle ID
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="vehicleId" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Available Seats
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="availableSeats" :disabled="!selectedRide" solo>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col align="center">
              <v-btn class="primary" :disabled="!changesMade" @click="applyChanges">
                Apply Changes
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "AdminRides",
  methods: {
    selectItem (item) {
      this.selectedRide = item;
      this.selectedRideIndex = this.rides.indexOf(this.selectedRide);
      this.updateInfo();
    },
    updateInfo(){
      const s = this.selectedRide;
      console.log(s);
      if(this.selectedRide){
        this.selectedFromLocationName = s.from_location.name;
        this.selectedToLocationName = s.to_location.name;
        this.driver = s.driver_id;
        this.time = s.time;
        this.date = this.formattedDate(s);
        this.distance = s.distance;
        this.fuelPrice = s.fuel_price;
        this.fee = s.fee;
        this.vehicleId = s.vehicle_id;
        this.availableSeats = s.avalable_seats;
      }
      else {
        this.fromLocation = -1;
      }
    },
    getRides(){
      this.$axios.get("/ride").then(response => {
        this.selectedRide = response.data[0];
        this.rides = response.data;
        this.updateInfo();

        for (const i in this.rides){
          if(!this.rides[i].from_location || !this.rides[i].to_location){
            console.log('delete me', this.rides[i].id);
          }
        }

        console.log('rides', this.rides);
      })
    },
    getLocations(){
      this.$axios.get("/location").then(response => {
        for (const location of response.data){
          this.all_locations[`${location.name}`] = location.id;
          this.all_location_names.push(`${location.name}`);
        }
      }).catch(err => {
        console.log("ERROR: " + err);
      });
    },
    applyChanges(){
      const newRide = {
        id: this.selectedRide.id,
        driver_id: this.driver,
        date: this.date, 
        time: this.time,
        distance: this.distance,
        fuel_price: this.fuelPrice,
        fee: this.fee,
        vehicle_id: this.vehicleId,
        avalable_seats: this.availableSeats,
        from_location: this.all_locations[this.selectedFromLocationName],
        to_location: this.all_locations[this.selectedToLocationName],
      }
      console.log('sending: ', newRide);
      this.$axios.patch(`/ride/${newRide.id}`, newRide).then(() => {
        this.getRides();
      }).catch(err => console.log(err));
    },
    addLocation(){
      const newLocation = {
        name: this.location_props[0][2],
        address: this.location_props[1][2],
        city: this.location_props[2][2],
        state: this.location_props[3][2],
        zip_code: this.location_props[4][2],
      }
      this.$axios.post('/location', newLocation).then(() => {
        this.showAddRideDialog = false;
        this.getLocations();

      }).catch(err => {
        console.log(err);
      })
    },
    addRide(){
      const defaultRide = {
        // id: this.selectedRide.id,
        driver_id: this.selectedRide.driver_id,
        date: "2000-01-01",
        time: "00:00",
        distance: 0,
        fuel_price: 0,
        fee: 0,
        vehicle_id: this.selectedRide.vehicle_id,
        avalable_seats: 0,
        from_location_id: this.all_locations[this.selectedFromLocationName],
        to_location_id: this.all_locations[this.selectedToLocationName],
      };
      console.log(defaultRide)
      this.$axios.post('/ride', defaultRide).then(() => {
        this.getRides();
      }).catch(err => {
        console.log(err);
      })
    },
    formattedDate: function(item) {   // thanks, https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
    
      var dateString = item.date;
      var dateList
      dateString = dateString.replace(/\.|T|Z|-|:/gi,"-")
      dateList = dateString.split("-")
      for (var i in dateList) {dateList[i] = parseInt(dateList[i],10)}
    
    
      var year = dateList[0]
      var month = dateList[1]
      var day = dateList[2]
      // var hour = dateList[3]
      // var min = dateList[4]
    
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

      return year+"-"+monthNames[month]+"-"+day
    },
  },
  computed: {
    changesMade: function(){
      if(!this.selectedRide.id) return false;
      const from= this.selectedFromLocationName != this.selectedRide.from_location.name;
      const to= this.selectedToLocationName != this.selectedRide.to_location.name;
      const driver = this.driver != this.selectedRide.driver_id;
      const date = this.date != this.formattedDate(this.selectedRide);
      const time = this.time != this.selectedRide.time;
      const distance = this.distance != this.selectedRide.distance;
      const fuelPrice = this.fuelPrice != this.selectedRide.fuel_price;
      const fee = this.fee != this.selectedRide.fee;
      const vehicleId = this.vehicleId != this.selectedRide.vehicle_id;
      const availableSeats = this.availableSeats != this.selectedRide.avalable_seats;

      console.log(from, to, driver, date, time, distance, fuelPrice, fee, vehicleId, availableSeats)

      return from || to || driver || date || time || distance || fuelPrice || fee || vehicleId || availableSeats;
    },

    valuesSet: function(){
      for( const type of this.location_props) {
        if (!type[2]) {
          return false;
        }
      }
      return true;
    },
  },
  mounted: function(){
    this.getLocations();
    this.getRides();
  },
  data: function() {
    return {

      to_location: {},
      from_location: {},
      all_locations: [],
      all_location_names: [],

      selectedToLocationName: "",
      selectedFromLocationName: "",
      // color: "",
      // licenseState: "",
      // licenseNumber: "",

      selectedRide: {},
      selectedRideIndex: 0,

      rides: [],

      headers: [
        {text: "From", value: "from_location"},
        {text: "To", value: "to_location"},
        {text: "Date", value: "date"},
        ],

        rideProps: [['From Location', 'from_location_id', ''], ['To Location', 'to_location_id', ''], ['Driver', 'driver_id', ''], ['Vehicle', 'vehicle_id', ''], ['Date', 'date', ''], ['Time', 'time', ''], ['Distance', 'distance', 0.0], ['Fuel Price', 'fuel_price', 0.0], ['Fee', 'fee', 0.0], ['Available Seates', 'available_seats', 0]],
        fromLocation: '',
        toLocation: '',
        driver: '',
        date: '',
        time: '',
        distance: 0.0,
        fuelPrice: 0.0,
        fee: 0.0,
        vehicleId: 0,
        availableSeats: 4,

        // Location
        location_props: [['Name', '',''], ['Address', '', ''], ['City', '', ''], ['State', '', ''], ['Zip Code', '', '']],
        name: "",
        address: "",
        city: "",
        state: 0.0,
        zip_code: 0,
        showAddRideDialog: false,


    }
  }
};
</script>
