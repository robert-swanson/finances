<template>
  <v-container>
    <v-row align="center" >
      <v-col>
        <p class="headline mb-0"> <b>Net Amount:</b> ${{net}} </p>
      </v-col>

      <v-col>
         <p class="headline mb-0"> <b>Reflecting Date:</b> {{reflectionDate}} </p>
      </v-col>
    </v-row>

    <v-container>
      <v-data-table
          :headers="transactionHeaders"
          :items="transactions"
          item-key="id"
          :sort-by="['dateISO']"
          :sort-desc="[true]"
          show-select
          v-model="selected"
          :items-per-page="100"
          :footer-props="{'items-per-page-options': [10, 100, 500, 1000, -1]}"
          :loading="loading" loading-text="Loading"
          :search="filter"
      >
        <template v-slot:top>
          <v-toolbar elevation="1">
            <v-text-field v-model="filter" label="Search" single-line hide-details  prepend-icon="mdi-magnify"/>
            <v-spacer/>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-call-split</v-icon>
                </v-btn>
              </template>
              <span>Split Transaction</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-call-merge</v-icon>
                </v-btn>
              </template>
              <span>Merge Transactions</span>
            </v-tooltip>



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
                <upload-files></upload-files>
<!--                <v-file-input multiple counter accept=".csv" class="ma-4">-->
<!--                  <template v-slot:selection="{ text }">-->
<!--                    <v-chip small label color="primary" >-->
<!--                      {{ text }}-->
<!--                    </v-chip>-->
<!--                  </template>-->
<!--                </v-file-input>-->
                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer/>
                  <v-btn color="primary" text @click="uploadFile" >
                    Upload
                  </v-btn>
                  <v-spacer/>
                </v-card-actions>
              </v-card>
            </v-dialog>

          </v-toolbar>
        </template>

        <template v-slot:item.statusEnum="{ item }">
          <v-tooltip bottom v-if="item.status=== 1" >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click="confirmTransaction(item)">
                <v-icon class="orange--text">mdi-eye</v-icon>
              </v-btn>
            </template>
            <span>Confirm Transaction</span>
          </v-tooltip>
          <v-tooltip bottom v-if="item.status=== 2" >
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="orange--text pa-2" v-bind="attrs" v-on="on">mdi-link-off</v-icon>
            </template>
            <span>Unlinked Transaction</span>
          </v-tooltip>
        </template>
        <template v-slot:item.description="props">
          <v-edit-dialog :return-value.sync="props.item.description" @save="modifiedDescription(props.item)"  >
            {{ props.item.description }}
            <template v-slot:input> <v-text-field v-model="props.item.description" :rules="[max64chars]" label="Edit" single-line counter ></v-text-field> </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.category="props">
          <v-edit-dialog :return-value.sync="props.item.category" @save="modifiedCategory(props.item)">
            {{ props.item.category }}
            <template v-slot:input>
              <v-autocomplete :items="categories" v-model="props.item.category " />
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.bucketString="props">
          <v-edit-dialog  @open="clickedTransactionBuckets(props.item)" @close="closedTransactionBuckets(props.item)">
            <template v-slot:input>
              <v-data-table
                :headers="bucketHeaders"
                :items="props.item.buckets"
                item-key="id"
                :hide-default-footer="true"
                class="pb-2"
                show-select
                v-model="selectedBuckets"
              >
                <template v-slot:item.amount=" { item }">
                  <v-edit-dialog :return-value.sync="item.amount" @save="modifiedTransactionBucketAmount">
                    {{asCurrency(item.amount)}}
                    <template v-slot:input>
                      <v-text-field v-model="item.amount"></v-text-field>
                    </template>
                  </v-edit-dialog>
                </template>
                <template v-slot:item.name=" { item }">
                  <v-edit-dialog @save="modifiedTransactionBucketName(item)">
                    {{item.name}}
                    <template v-slot:input>
                      <v-autocomplete :items="buckets" v-model="item.name " />
                    </template>
                  </v-edit-dialog>
                </template>
                <template v-slot:footer style="">
                  <v-row style="border-top: solid; border-top-color: black; border-top-width: 1px;" class="mt-1">
                    <v-col class="pa-0">
                      <v-btn icon @click="clickedAddTransactionBucket" color="primary"><v-icon>mdi-plus</v-icon></v-btn>
                      <v-btn icon @click="deleteTransactionBuckets" color="primary"><v-icon>mdi-minus</v-icon></v-btn>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col>
                      <span style="margin-left: auto; margin-right: 0" :class="currentExpected === currentNet ? 'green--text' : 'red--text font-weight-bold'">{{asCurrency(currentExpected-currentNet)}} </span>
                    </v-col>
                  </v-row>
                </template>
              </v-data-table>
            </template>

            <v-tooltip v-for="bucket in props.item.buckets" :key="bucket.id" bottom>
              <template #activator="{ on }">
                <v-chip dense v-on="on" outlined v-bind:class="{'green--text': bucket.amount > 0, 'green': bucket.amount > 0, 'red--text': bucket.amount < 0, 'red': bucket.amount < 0, 'grey--text': bucket.amount === 0, 'grey': bucket.amount === 0, 'mr-1': true}">{{bucket.name}}</v-chip>
              </template>
              {{asCurrency(bucket.amount)}}
            </v-tooltip>
          </v-edit-dialog>
        </template>
        <template v-slot:item.amount="{ item }">
          <span v-if="item.amount> 0" class="green--text">{{item.amountCurr}}</span>
          <span v-if="item.amount < 0" class="red--text">{{item.amountCurr}}</span>
          <span v-if="item.amount === 0.0" class="blue--text">{{item.amountCurr}}</span>
        </template>
        <template v-slot:item.dateISO =" { item }">
          <v-edit-dialog @save="modifiedDate(item)">
            <template v-slot:input>
              <v-date-picker v-model="item.dateISO"></v-date-picker>
            </template>
            <span>{{item.dateFormatted}}</span>
          </v-edit-dialog>

        </template>
      </v-data-table>
      <v-snackbar v-model="snackOn" :timeout="3000" :color="snackColor" >
        {{ snackText }}
        <template v-slot:action="{ attrs }"> <v-btn v-bind="attrs" text @click="snackOn = false" > Close </v-btn> </template>
      </v-snackbar>
    </v-container>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import UploadFiles from "@/components/UploadFiles";

export default {
  name: "Dashboard",
  components: {UploadFiles},
  computed: {

  },

  methods: {
    //  ================ Parsing Transactions =================
    updateData() {
      this.updateTransactions()
      this.categories = this.categoriesQuery.map(cat => cat.name)
      this.buckets = []
      this.bucketIDs = {}
      for (const bucket of this.bucketsQuery) {
        this.buckets.push(bucket.name)
        this.bucketIDs[bucket.name] = bucket.id
      }

      console.log("buckets", this.buckets)
      console.log("bucketIDs", this.bucketIDs)
      console.log("transactions", this.transactions)
    },

    updateTransactions() {
      console.log("Loading Transactions")
      this.transactions = []
      for (const transaction of this.transactionsQuery) {
        const bucketInfo = this.transactionBuckets(transaction)
        const date = new Date(parseInt(transaction.date)).toISOString().substr(0, 10)
        this.transactions.push({
          id: transaction.id,
          description: transaction.description,
          dateFormatted: this.formattedDate(date),
          dateISO: date,
          category: transaction.category.name,
          bucketString: bucketInfo.bucketString,
          buckets: bucketInfo.buckets,
          status: transaction.status.id,
          statusEnum: this.transactionStatus(transaction),
          amount: this.transactionAmount(transaction),
          amountCurr: this.asCurrency(this.transactionAmount(transaction)),
        })
      }
      this.transactions = this.transactions.sort((a, b) => a.id - b.id)
      this.loading=false
    },

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    transactionAmount(transaction) {
      var amount = 0
      transaction.statementTransaction.forEach(prtAmt => amount+=prtAmt.partial_amount)
      return amount
    },

    transactionStatus(transaction) {
      return transaction.status.id === 1 ? "unconfirmed": (transaction.status.id === 2 ? "unlinked" : "ready")
    },

    transactionBuckets(transaction) {
      var buckets = []
      var bucketString = ""
      transaction.transactionBucket.forEach(tb => {
        buckets.push({
          id: this.nextTransactionBucketID,
          name: tb.bucket.name,
          amount: tb.bucket_amount,
          priorityName: tb.bucket.priority.name,
          priorityLevel: tb.bucket.priority.level,
        })
        bucketString += tb.bucket.name
        this.nextTransactionBucketID++
      })
      return {buckets, bucketString}
    },

    // ================== Handlers =================
    uploadFile() {
      this.csvDialog = false
      console.log("upload")
    },

    transactionClicked(event) {
      console.log("clicked", event)
    },

    deleteUnlinked(event) {
      console.log("clicked", event)
    },

    addBucket(event) {
      console.log(event)
    },

    confirmTransaction(transaction) {
      this.$apollo.mutate({
        mutation: gql`mutation ConfirmTransaction($id: Int!) {
    confirmTransaction(id: $id)
}`,
        variables: {
          id: transaction.id,
          description: transaction.description
        },
      })
      .then(() => {
        this.snack("Confirmed Transactions")
      })
      .catch((err) => {
        console.log(err)
        this.snackErr("Not Saved")
      })
      console.log("Confirmed Transaction: ", transaction)
      transaction.status = 3
      transaction.statusEnum = "ready"
    },

    modifiedDescription(transaction) {
      console.log("Changed description to: ", transaction.description)
      this.$apollo.mutate({
          mutation: gql`mutation($id: Int!, $description: String!) {
                     editDescription(id: $id, description: $description)
                     }`,
          variables: {
                   id: transaction.id,
                   description: transaction.description
                   },
      })
          .then(this.snack("Changed Description"))
          .catch((err) => {
            console.log(err)
            this.snackErr("Not Saved")
          })
    },

    modifiedCategory(transaction) {
      console.log("Changed category to: ", transaction)
      this.$apollo.mutate({
        mutation: gql`mutation EditCategory($id: Int!, $category: String!) {
    editCategory(id: $id, category: $category)
}`,
        variables: {
          id: transaction.id,
          category: transaction.category
        },
      })
          .then(this.snack("Changed Category"))
          .catch((err) => {
            console.log(err)
            this.snackErr("Not Saved")
          })
    },

    modifiedDate(transaction) {
      console.log(transaction)
      const variables = {
        id: transaction.id,
        date: transaction.dateISO
      }
      console.log("Mutating date: ", variables)
      transaction.dateFormatted = this.formattedDate(transaction.dateISO)
      this.$apollo.mutate({
        mutation: gql`mutation RootMutationType($id: Int!, $date: String!) {
    editDate(id: $id, date: $date)
}`,
        variables,
      })
    },

    clickedAddTransactionBucket () {
      this.currentTransaction.buckets.push({
        id: this.nextTransactionBucketID,
        name: 'Default',
        amount: 0,
        priorityName: '',
        priorityLevel: 0,
      })
      this.nextTransactionBucketID++
    },

    deleteTransactionBuckets() {
      var ids = this.selectedBuckets.map(bkt => bkt.id)
      console.log("Old Buckets", this.currentTransaction.buckets)
      this.currentTransaction.buckets = this.currentTransaction.buckets.filter(bkt => !ids.includes(bkt.id))
      console.log("New Buckets", this.currentTransaction.buckets)
      // this.currentTransaction.buckets = this.currentTransaction.buckets.filter(bkt => this.selectedBuckets.filter(selectedBkt => selectedBkt.id === bkt.id).length > 0)
    },

    modifiedTransactionBucketAmount() {
      var sum = 0
      this.currentTransaction.buckets.forEach(b => sum += parseFloat(b.amount))
      this.currentNet = sum
      console.log("modified", this.currentNet)
    },

    modifiedTransactionBucketName(bucket) {
      this.currentTransaction.bucketString = ""
      this.currentTransaction.buckets.forEach(bkt => {
        this.currentTransaction.bucketString += bkt.name
      })
      bucket.id = this.bucketIDs[bucket.name]
    },

    clickedTransactionBuckets (transaction) {
      console.log(transaction)
      this.currentTransaction = transaction
      this.currentExpected = transaction.amount
      this.modifiedTransactionBucketAmount()
      console.log(transaction.amount)
    },

    closedTransactionBuckets(transaction) {
      console.log("closed buckets: ", transaction)
      this.currentTransaction.bucketString = ""
      var seenBuckets = []
      var bucketSum = 0;
      var variables = {
        transaction_id: transaction.id,
        buckets: [ ]
      }

      for (const bkt of transaction.buckets) {
        console.log(bkt.name)
        if (seenBuckets.includes(bkt.name)) {
          this.snackErr("Duplicate Bucket '" + bkt.name + "', Not Saved")
          return
        } else {
          seenBuckets.push(bkt.name)
        }
        bkt.amount = parseFloat(bkt.amount)
        this.currentTransaction.bucketString += bkt.name
        bucketSum += bkt.amount
        variables.buckets.push({
          bucket_id: bkt.id,
          bucket_amount: bkt.amount
        })
        console.log(transaction.id, bkt.id, bkt.amount)
      }

      console.log(seenBuckets)

      const error = bucketSum - transaction.amount
      if (error !== 0) {
        this.snackErr(this.asCurrency(error) + " Missing, Not Saved")
        transaction.buckets = this.currentTransaction.buckets
        console.log("Counted: " + bucketSum, " Expected: " + transaction.amount)
      } else {
        console.log("Saving Buckets: \n", variables)
        this.$apollo.mutate({
          mutation: gql`mutation SetTransactionBuckets($transaction_id: Int!, $buckets: [UniqueName]!) {
    setTransactionBuckets(transaction_id: $transaction_id, buckets: $buckets)
}`,
          variables,
        })
            .then(this.snack("Buckets Saved"))
            .catch((err) => {
              console.log(err)
              this.snackErr("Not Saved")
            })
      }
      //    Need to make query to delete and create (maybe selectivly update instead) transactionBuckets
    },

    clickedBucketRow(val) {
      console.log(val)
    },

    snack(message){
      this.snackOn = true
      this.snackColor = 'success'
      this.snackText = message
    },

    snackErr(message){
      this.snackOn = true
      this.snackColor = 'error'
      this.snackText = message
    },

    // ==================== Formatters =============
    asCurrency(num) {
      if (typeof num == "string") {
        try {
          num = parseFloat(num)
        } catch {
          return num
        }
      }
      if (num < 0) {
        return "- $"+(-1*num).toFixed(2)
      } else {
        return "$"+num.toFixed(2)
      }
    },

    formattedDate(input) {   // thanks, https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
      const date = new Date(input)
      date.setDate(date.getDate()+1)
      var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
      return monthNames[date.getMonth()] + " " + date.getDate() + ", " + (1900 + date.getYear())
    },
  },

  mounted: function() {
    this.loading=true
    this.sleep(500)
        .then(this.updateData)
  },

  data: function() {
    return {
      net: 3141.15,
      reflectionDate: "1/12/21",
      newBookName: "",

      transactions: [],
      transactionsQuery: [],
      currentTransaction: {},

      categories: [],
      categoriesQuery: [],

      buckets: [],
      bucketIDs: {},
      bucketsQuery: [],
      selectedBuckets: [],
      nextTransactionBucketID:  0,

      loading: true,
      transactionHeaders: [
        {text: "", value: "statusEnum"},
        {text: "Description", value: "description"},
        {text: "Category", value: "category"},
        {text: "Bucket", value: "bucketString"},
        {text: "Amount", value: "amount"},
        {text: "Date", value: "dateISO"},
        {text: "Date", value: "dateFormatted", align: ' d-none'},
      ],
      bucketHeaders: [
        {text: "Bucket", value: "name"},
        {text: "Amount", value: "amount"},
      ],
      filter: '',
      selected: [],
      max64chars: v => v.length <= 64 || 'Input too long!',
      snackText: '',
      snackColor: '',
      snackOn: false,
      importDialog: false,
      csvDialog: false,
      csvTooltip: false,
      currentNet: 100,
      currentExpected: 100
    }
  },

  apollo: {
    categoriesQuery: {
      query: gql`
      {
        categoriesQuery: categorys {
          name
        }
      }`
    },
    bucketsQuery: {
      query: gql`{
        bucketsQuery: buckets {
            name
            id
        }
      }`
    },
    transactionsQuery: {
      query: gql`
        {
          transactionsQuery: transactions {
            id
            description
            date
            category {
              name
            }
            status {
              description
              id
            }
            statementTransaction {
              partial_amount
            }
            transactionBucket {
              transaction_id
              bucket_id
              bucket_amount
              bucket {
                name
                priority {
                    name
                    level
                }
              }
            }
          }
        }
    `,
    },
  },

}
</script>