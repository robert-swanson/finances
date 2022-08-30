<template>
  <v-container>
    <v-card-text class="display-2 pl-0">Drivers</v-card-text>
    <v-container>
      <v-row v-if="driverID == -1">    <!-- signin box if not logged in -->
        <v-col><v-text-field label="First Name" v-model="firstName"> </v-text-field>  </v-col>
        <v-col><v-text-field label="Last Name" v-model="lastName"> </v-text-field>    </v-col>
        <v-col><v-text-field label="Phone" v-model="phoneNumber"> </v-text-field>     </v-col>
        <v-col><v-text-field label="License Plate" v-model="licenseNumber"> </v-text-field> </v-col>

        <v-col align="center" cols="2">   <v-btn class="primary" v-on:click="signin" :disabled="!signinValid"> Sign In </v-btn> </v-col>
        <v-col align="center" cols="2" >  <v-btn v-on:click="signup" :disabled="!signupValid"> Sign Up </v-btn>                 </v-col>
      </v-row>

      <v-row v-if="driverID != -1">    <!-- Welcome message and large buttons if logged in -->
        <v-col><v-card-text class="display-1 pl-0">Welcome {{firstName}} {{lastName}}!</v-card-text>   </v-col>
        <v-col cols="2" align-self="center">    <v-btn class="primary" v-on:click="signout">Sign Out</v-btn>  </v-col>
      </v-row>

      <v-snackbar v-model="loginFailureSnackbar">   <!-- login failed popup ("Snackbar") -->
        Login Failed
         <v-btn color="pink" text @click="loginFailureSnackbar = false" >
           Close
         </v-btn>
      </v-snackbar>

      <v-card v-if="driverID != -1"> <v-card-title>My Rides</v-card-title> <!-- table of rides, displayed if logged in -->
        <v-data-table :headers="headers" :items="myRides" >

          <template v-slot:item.registerButton="{ item }">  <!-- A little clickable button to register for a ride. -->
            <v-icon large center :color="registerButtonColor( item )" @click="toggleRegisterdForRide(item)">mdi-car</v-icon>
          </template>
          <template v-slot:item.remaining_seats="{ item }">
            {{ calculateSeatsLeft(item) }}
          </template>
          <template v-slot:item.niceDate="{ item }">
            {{ formattedDate(item) }}
          </template>
        </v-data-table>
      </v-card>

      <v-card v-if="driverID != -1"> <v-card-title>Available rides</v-card-title> <!-- table of rides, displayed if logged in -->
        <v-data-table :headers="headers" :items="availableRides" >
          <template v-slot:item.registerButton="{ item }">  <!-- A little clickable button to register for a ride. -->
            <v-icon large center :color="registerButtonColor( item )" @click="toggleRegisterdForRide(item)">mdi-car</v-icon>
          </template>
          <template v-slot:item.remaining_seats="{ item }">
            {{ calculateSeatsLeft(item) }}
          </template>
          <template v-slot:item.niceDate="{ item }">
            {{ formattedDate(item) }}
          </template>
        </v-data-table>
      </v-card>

    </v-container>
  </v-container>
</template>

<script>
export default {
  name: "Driver",
  computed: {
    signinValid: function(){  // makes sure first and last names are not empty
      return this.firstName != "" && this.lastName != "";
    },
    signupValid: function(){  // makes sure first and last names etc are not empty
      return this.firstName != "" && this.lastName != "" && this.phoneNumber != "" && this.licenseNumber != "";
    },
  },

  methods: {
    signin: function() {  // ran by signin button. Checks given first + last name is in the drivers list. then sets our passenger id to match
      this.$axios.get("/driver").then(response => {
        for (const i in response.data) {  // look through all passengers
          const driver = response.data[i];
          if (driver.first_name == this.firstName && driver.last_name == this.lastName){  // if we find ourselves
            this.driverID = driver.id;

            // console.log(this.driverRides);
            this.refreshData();
            return;
          }
        }
        this.loginFailureSnackbar = true;
      })
    },
    signout: function() { // Forgets who we are
      this.firstName = "";
      this.lastName = "";
      this.phoneNumber = "";
      this.licenseNumber = "";
      this.driverID = -1;
      this.driverRides= [];
      this.myRides= [];
      this.myVehicles = [];
      this.availableRides= [];
    },
    signup: function() {  // makes a new passenger from given info. activates  loginFailureSnackbar if not valid
        this.$axios.post("/driver",
          {first_name: this.firstName, last_name: this.lastName, phone: this.phoneNumber, license_number: this.licenseNumber}
        ).then(result => {
          if (result.status === 200) {
            // console.log("sign up")
            this.signin();
          } else {
            this.loginFailureSnackbar = true;
            console.log(result.data.ok)
          }
        }).catch(err => {
            this.loginFailureSnackbar = true;
            console.log(err)
        })
     },

    // newRide: function() {
    //
    // },

    toggleRegisterdForRide: function(item)  {
      // console.log(this.driverID);
      // console.log(item.id);
      // console.log("You pushed the button!");

      if (this.driverID == item.driver_id) {
        console.log("Currently registered, going to UN-register");
        // console.log("/ride/"+item.id)
        this.$axios.patch("/ride/"+item.id, {
          driver_id: null,
        }).then(responce => {
          console.log(responce)
          // this.driverRides.splice(this.driverRides.indexOf(item.id),1)
          this.refreshData()
        }
        ).catch(err => { console.log("Error un-registering from ride: " + err) })
      }
      else {
        console.log("Currently NOT registered, going to register");

        if (this.registerAvailability(item) == 0) {
          this.$axios.patch("/ride/"+item.id, {
            driver_id: this.driverID,
          }).then(responce => {
            console.log(responce)
            // this.driverRides.splice(this.driverRides.indexOf(item.id),1)
            this.refreshData()
          }).catch(err => {
            console.log("Error registering for rides: " + err);
          })
        }
        else {console.log("Error: You cannot register for this ride.")}

      }

    },

    registerButtonColor: function(item){
      switch (this.registerAvailability(item)) {
        case 1: return "success";
        case 0: return "disabled";
        default: return "error";
      }
    },

    registerAvailability: function(item){
      // console.log(item.driver_id)
      if (this.driverID == item.driver_id) { return 1; }  // we've registerd for this ride
      if (!this.myVehicles.includes(item.vehicle_id)) {return -1; } // if we arn't authorized for that car
      if (item.driver_id == null) { return 0 }  // then no one has registered
      return -1;  // someone else has registered
    },

    calculateSeatsLeft: function(item){
      return(item.avalable_seats - item.passenger.length)
    },

    formattedDate: function(item) {   // thanks, https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
      // console.log(item.date)

      var dateString = item.date;
      var dateList
      dateString = dateString.replace(/\.|T|Z|-|:/gi,"-")
      dateList = dateString.split("-")
      for (var i in dateList) {dateList[i] = parseInt(dateList[i],10)}

      // console.log(dateList)

      var year = dateList[0]
      var month = dateList[1]
      var day = dateList[2]
      // var hour = dateList[3]
      // var min = dateList[4]

      // var monthNames = [
      //   "January", "February", "March",
      //   "April", "May", "June", "July",
      //   "August", "September", "October",
      //   "November", "December"
      // ];

      return year+"-"+month+"-"+day
    },

    refreshData: function() {   // dumps all db rides into this.rides
      this.$axios.get("/ride").then(response => {
        console.log("Responce data! ")
        console.log(response.data)

        this.rides = response.data
        this.myRides = [];
        this.availableRides = [];

        for (var i = 0; i < response.data.length; i++) {
          if (response.data[i].driver_id == this.driverID)    { this.myRides.push(response.data[i]) }
          else if (response.data[i].driver_id == null) { this.availableRides.push(response.data[i]) }
        }
        // console.log(this.rides);

        // get list of registered vehicles
        this.$axios.get("/authentication/driver/"+this.driverID).then(response => {
          this.myVehicles = [];
          for (var i = 0; i < response.data.length; i++) {
            this.myVehicles.push(response.data[i].vehicle_id)
          }
          // console.log(this.myVehicles)
        }).catch(err => { console.log("Error fetching your vehicles: " + err); })

      }).catch(err => { console.log("Error fetching rides: " + err); })
    }
  },

  mounted: function(){    // Simply runs refreshData
    this.refreshData()
  },

  data: function()  {
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      licenseNumber: "",
      driverID: -1,
      myRides: [],
      availableRides: [],
      myVehicles: [],
      rides: [],
      driverRides: [],

      renderComponent: true,
      loginFailureSnackbar: false,

      headers: [
        // {text: "ID", value: "id"},
        {text: "From", value: "from_location.name"},
        {text: "To", value: "to_location.name"},
        {text: "Date", value: "niceDate"},
        {text: "Remaining Seats", value: "remaining_seats"},
        {text: "Register", value: "registerButton", sortable: false}
      ]
    }
  }
};
</script>
