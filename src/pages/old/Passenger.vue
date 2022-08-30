<template>
  <v-container>
    <v-card-text class="display-2 pl-0" v-if="renderComponent">Passsenger</v-card-text>
    <v-container>
      <v-row v-if="passengerId == -1">    <!-- signin box if not logged in -->
        <v-col>
          <v-text-field label="First Name" v-model="firstName"> </v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Last Name" v-model="lastName"> </v-text-field>
        </v-col>
        <v-col>
          <v-text-field label="Phone" v-model="phoneNumber"> </v-text-field>
        </v-col>
        <v-col align="center" cols="2">
            <v-btn class="primary" v-on:click="signin" :disabled="!signinValid"> Sign In </v-btn>
        </v-col>
        <v-col align="center" cols="2" >
          <v-btn v-on:click="signup" :disabled="!signupValid"> Sign Up </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="passengerId != -1">    <!-- Welcome message and sign out button if logged in -->
        <v-col>
          <v-card-text class="display-1 pl-0">
            Welcome {{firstName}} {{lastName}}!
          </v-card-text>
        </v-col>
        <v-col cols="2" align-self="center">
          <v-btn class="primary" v-on:click="signout">
            Sign Out
          </v-btn>
        </v-col>
      </v-row>

      <v-snackbar v-model="loginFailureSnackbar">   <!-- login failed popup ("Snackbar") -->
        Login Failed
         <v-btn color="pink" text @click="loginFailureSnackbar = false" >
           Close
         </v-btn>
      </v-snackbar>

      <v-data-table :headers="headers" :items="rides" v-if="passengerId != -1">   <!-- table of rides, displayed if logged in -->
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
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: "Passenger",
  computed: {
    signinValid: function(){  // makes sure first and last names are not empty
      return this.firstName != "" && this.lastName != "";
    },
    signupValid: function(){  // makes sure first and last names and phone number are not empty
      return this.firstName != "" && this.lastName != "" && this.phoneNumber != "";
    },
  },

  methods: {
    signin: function() {  // ran by signin button. Checks given first + last name is in the passengers list. then sets our passenger id to match
      this.$axios.get("/passenger").then(response => {
        for (const i in response.data) {  // look through all passengers
          const passenger = response.data[i];
          if (passenger.first_name == this.firstName && passenger.last_name == this.lastName){  // if we find ourselves
            this.passengerId = passenger.id;

            this.$axios.get("/passenger/"+this.passengerId+"/ride").then(response2 => {         // generate the list of rides we're already a part of
              for (const j in response2.data) {
                console.log(response2.data[j].ride_id);
                this.passengerRides.push(response2.data[j].ride_id);
              }
            })
            console.log(this.passengerRides);
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
      this.passengerId = -1;
      this.passengerRides= [];
    },
    signup: function() {  // makes a new passenger from given info. activates  loginFailureSnackbar if not valid
        this.$axios.post("/passenger", {first_name: this.firstName, last_name: this.lastName, phone: this.phoneNumber}).then(result => {
          if (result.status === 200) {
            console.log("sign in")
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

    toggleRegisterdForRide: function(item)  {
      console.log(this.passengerId);
      console.log(item.id);
      console.log("You pushed the button!");

      if (this.passengerRides.includes(item.id)) {
        console.log("Currently registered, going to UN-register");

        this.$axios.delete("/ride/"+item.id+"/passenger/"+this.passengerId).then(responce => {
          console.log(responce)
          this.passengerRides.splice(this.passengerRides.indexOf(item.id),1)
          this.refreshData()
        }
        ).catch(err => { console.log("Error un-registering from ride: " + err) })

      } else {
        console.log("Currently NOT registered, going to register");
        if (this.calculateSeatsLeft(item) > 0) {
          this.$axios.post("/ride/passenger", {
            passenger_id: this.passengerId,
            ride_id: item.id

          }).then(responce => {
            console.log(responce);
            this.passengerRides.push(item.id);
            this.refreshData()
          }).catch(err => {
            console.log("Error registering for rides: " + err);
          })
        }
        else {console.log("Error: There are no more seats available.")}

      }

    },

    registerButtonColor: function(item){
      // console.log("Seting color for ride "+item.id);
      // console.log("Is it one of these rides? "+this.passengerRides);
      if (this.passengerRides.includes(item.id)) {
        // console.log("Found it!");
        return "success";
      }
      if (this.calculateSeatsLeft(item) == 0) { return "error" }
      // console.log("It's none of those rides");
      return "disabled";
    },

    calculateSeatsLeft: function(item){
      return(item.avalable_seats - item.passenger.length)
    },

    formattedDate: function(item) {   // thanks, https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
      console.log(item.date)

      var dateString = item.date;
      var dateList
      dateString = dateString.replace(/\.|T|Z|-|:/gi,"-")
      dateList = dateString.split("-")
      for (var i in dateList) {dateList[i] = parseInt(dateList[i],10)}

      console.log(dateList)

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

    refreshData: function() {
      this.$axios.get("/ride").then(response => {
        this.rides = response.data;
        // console.log(this.rides);
      }).catch(err => {
        console.log("Error fetching rides: " + err);
      })
    }


  },
  mounted: function(){    // dumps all db rides into this.rides
    this.refreshData()
  },

  data: function()  {
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      passengerId: -1,
      rides: [],
      passengerRides: [],

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
