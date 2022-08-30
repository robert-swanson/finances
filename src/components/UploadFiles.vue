<template>
  <v-dialog v-model="csvDialog" width="500">
    <template v-slot:activator="{ on: csvDialog, attrs: csvDialogAttrs}">
      <v-tooltip bottom v-model="csvTooltip">
        <template v-slot:activator="{ on: csvTooltip, attrs: csvTooltipAttrs}">
          <v-btn icon v-on="{ ...csvDialog , ...csvTooltip}" v-bind="{...csvDialogAttrs, ...csvTooltipAttrs}">
            <v-icon>mdi-file-import</v-icon>
          </v-btn>
        </template>
        <span>Import CSV Files</span>
      </v-tooltip>
    </template>
    <v-card>
      <v-card-title> Import CSV Files </v-card-title>
      <v-divider/>
      <div>
        <v-row no-gutters justify="center" align="center" class="ma-4">
            <v-file-input
                show-size
                label="File input"
                accept=".csv"
                @change="selectFile"
            ></v-file-input>
        </v-row>
        <v-alert v-if="message" border="left" color="warning" dark class="ma-4">
          {{ message }}
        </v-alert>
      </div>
      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary" text @click="upload" >
          Upload
          <v-icon right dark>mdi-cloud-upload</v-icon>
        </v-btn>
        <v-spacer/>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import UploadService from "../../../personal-finances-api/src/services/UploadFilesService";
export default {
  name: "upload-files",
  data() {
    return {
      currentFile: undefined,
      progress: 0,
      message: "",
      fileInfos: [],
      csvDialog: false,
      csvTooltip: false,
      resp: undefined
    };
  },
  methods: {
    selectFile(file) {
      this.progress = 0;
      this.currentFile = file;
    },
    upload() {
      if (!this.currentFile) {
        this.message = "Please select a file!";
        return;
      }
      this.message = "";
      UploadService.upload(this.currentFile, (event) => {
        this.progress = Math.round((100 * event.loaded) / event.total);
      })
          .then((response) => {
            this.resp = response
            return UploadService.getFiles();
          })
          .then((files) => {
            this.fileInfos = files.data;
            this.csvDialog = false
            this.csvTooltip = false
          })
          .catch((err) => {
            this.progress = 0;
            this.message = "Could not upload the file!\n"+err;
            this.currentFile = undefined;
          });
    },
  }
};
</script>