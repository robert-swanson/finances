<template>
  <v-dialog v-model="splitDialog" width="500">
    <template v-slot:activator="{ on: splitDialog, attrs: splitDialogAttrs}">
      <v-tooltip right v-model="splitTooltip">
        <template v-slot:activator="{ splitToolTip, splitTooltipAttrs }">
          <v-btn fab dark small color = "blue" v-on="{...splitDialog, ...splitTooltip}" v-bind="{...splitDialogAttrs, ...splitTooltipAttrs}">
            <v-icon>mdi-call-split</v-icon>
          </v-btn>
        </template>
        <span>Split Transaction</span>
      </v-tooltip>
    </template>
    <v-card>
      <v-card-title> Split Transaction </v-card-title>
      <v-divider/>

      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary" text>
          Upload
          <v-icon right dark>mdi-cloud-upload</v-icon>
        </v-btn>
        <v-spacer/>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "split-transaction",
  data() {
    return {
      splitDialog: false,
      splitTooltip: false,
    };
  },
  methods: {
  }
};
</script>