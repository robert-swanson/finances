<style scoped>
.selectedRow {
    /* background-color: red; */
    font-weight: bold;
}

</style>
<template>
  <v-container>
    <v-card-text class="display-2 pl-0"> Vehicles </v-card-text>
    <v-btn class="primary" @click="addVehicle">
      Add Vehicle
    </v-btn>
    <v-row align="stretch">
      <v-col>
        <v-data-table :headers="headers" :items="vehicles" sort-by="id">
          <template v-slot:body="{ items }">
              <tbody>
                <tr v-for="item in items" :key="item.id" @click="selectItem(item)" :class="{'selectedRow': item === selectedVehicle}">
                  <td>{{ item.id }}</td>
                  <td>{{ item.vehicle_type.make }}</td>
                  <td>{{ item.vehicle_type.model }}</td>
                  <td>{{ item.license_number }}</td>
                </tr>
              </tbody>
          </template>
        </v-data-table>
      </v-col>
      <v-col>
        <v-card class="pa-4">
          <v-card-text class="display-1">
            Vehicle Information
          </v-card-text>

          <v-row align="center">
            <v-col :cols="4">
              <v-card-text>
                Type
              </v-card-text>
            </v-col>
            <v-col :cols="5">
              <v-combobox v-model="selected_summary" :items="vehicle_summaries" :disabled="!selectedVehicle"> 
              </v-combobox>
            </v-col>
            <v-col :cols="3">
              <v-dialog v-model="showAddVehicleDialog" width="500">
                <template v-slot:activator="{ on }">
                  <v-btn outlined v-on="on">
                    <v-icon>
                      mdi-plus
                    </v-icon>
                  </v-btn>
                </template>
                
                <v-card class="pa-4">
                  <v-card-title>
                    Add Vehicle Type
                  </v-card-title>
                  <v-container>
                    <v-row v-for="prop in vehicle_type_props" :key="prop[0]">
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
                        <v-btn class="primary" :disabled="!valuesSet" @click="addVehicleType">
                          Add
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                Color
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="color" :disabled="!selectedVehicle" solo> 
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                License State     
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="licenseState" :disabled="!selectedVehicle" solo> 
              </v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="4">
              <v-card-text>
                License Number     
              </v-card-text>
            </v-col>
            <v-col>
              <v-text-field v-model="licenseNumber" :disabled="!selectedVehicle" solo> 
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
  name: "AdminVehicles",
  methods: {
    selectItem (item) {
      this.selectedVehicle = item;
      this.selectedVehicleIndex = this.vehicles.indexOf(this.selectedVehicle);
      this.updateInfo();
    },
    updateInfo(){
      if(this.selectedVehicle){
        console.log(this.selectedVehicle)
        this.color = this.selectedVehicle.color;
        this.licenseState = this.selectedVehicle.license_state;
        this.licenseNumber = this.selectedVehicle.license_number;
        this.selected_summary = `${this.selectedVehicle.vehicle_type.make} ${this.selectedVehicle.vehicle_type.model}`
      }
      else {
        this.color = "";
        this.licenseState = "";
        this.licenseNumber = "";
        this.selected_summary = "";
      }
    },
    getVehicles(){
      this.$axios.get("/vehicle").then(response => {
        this.selectedVehicle = response.data[0];
        this.vehicles = response.data;
        this.updateInfo();
      })
    },
    applyChanges(){
      const newVehicle = {
        id: this.selectedVehicle.id,
        color: this.color,
        vehicle_type_id: this.vehicle_types[this.selected_summary],
        license_state: this.licenseState,
        license_number: this.licenseNumber
      }
      this.$axios.patch(`/vehicle/${newVehicle.id}`, newVehicle).then(() => {
        this.getVehicles();
      }).catch(err => console.log(err));
    },
    addVehicleType(){
      const newType = {
        type: this.vehicle_type_props[0][2],
        make: this.vehicle_type_props[1][2],
        model: this.vehicle_type_props[2][2],
        mpg: this.vehicle_type_props[3][2],
        total_seats: this.vehicle_type_props[4][2],
      }
      this.$axios.post('/vehicle_type', newType).then(() => {
        this.showAddVehicleDialog = false;
      }).catch(err => {
        console.log(err);
      })
    },
    addVehicle(){
      const defaultVehicle = {
        color: 'default-color',
        vehicle_type_id: this.selectedVehicle.vehicle_type_id,
        license_state: '--',
        license_number: 'default-num'
      };
      console.log(defaultVehicle);
      this.$axios.post('/vehicle', defaultVehicle).then(() => {
        this.getVehicles();
      }).catch(err => {
        console.log(err);
      })
    }
  },
  computed: {
    changesMade: function(){
      if(!this.selectedVehicle.color) return false;
      const colorChanged = this.color != this.selectedVehicle.color;
      const stateChanged = this.licenseState != this.selectedVehicle.license_state;
      const numberChanged = this.licenseNumber != this.selectedVehicle.license_number;
      const typeChanged = this.selected_summary != `${this.selectedVehicle.vehicle_type.make} ${this.selectedVehicle.vehicle_type.model}`;

      return colorChanged || stateChanged || numberChanged || typeChanged;
              
    },

    valuesSet: function(){
      for( const type of this.vehicle_type_props) {
        if (!type[2]) {
          return false;
        }
      }
      return true;
    },
  },
  mounted: function(){
    this.$axios.get("/vehicle_type").then(response => {
      for (const vehicle of response.data){
        this.vehicle_types[`${vehicle.make} ${vehicle.model}`] = vehicle.id;
        this.vehicle_summaries.push(`${vehicle.make} ${vehicle.model}`);
      }
    }).catch(err => {
      console.log("ERROR: " + err);
    });

    this.getVehicles();
  },
  data: function() {
    return {

      vehicle_types: {},
      vehicle_summaries: [],

      selected_summary: "",
      color: "",
      licenseState: "",
      licenseNumber: "",

      selectedVehicle: {},
      selectedVehicleIndex: 0,

      vehicles: [],

      headers: [
        {text: "ID", align: "left", value: "id"},
        {text: "Make", value: "vehicle_type.make"},
        {text: "Model", value: "vehicle_type.model"},
        {text: "License Number", value: "license_number"},
        ],

        // Add Vehicle_Type
        vehicle_type_props: [['Type', 'eg. Sedan',''], ['Make', 'eg. Honda', ''], ['Model', 'eg. Accord', ''], ['MPG', 'eg. 23.3', ''], ['Total Seats', 'eg. 4', '']],
        type: "",
        make: "",
        model: "",
        mpg: 0.0,
        total_seats: 0,
        showAddVehicleDialog: false,


    }
  } 
};
</script>
