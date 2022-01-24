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
          :sort-by="['dateMills']"
          :sort-desc="[true]"
          show-select
          v-model="selected"
          :items-per-page="100"
          :footer-props="{'items-per-page-options': [10, 100, 500, 1000, -1]}"
          :loading="loading" loading-text="Loading"
          :search="filter"
      >
        <template v-slot:top>
          <v-toolbar class="blue lighten-4" elevation="1">
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
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-file-import</v-icon>
                </v-btn>
              </template>
              <span>Import CSV File</span>
            </v-tooltip>
          </v-toolbar>
        </template>

        <template v-slot:item.statusEnum="{ item }">
          <v-tooltip bottom v-if="item.status=== 1" >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
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
          <v-tooltip bottom v-if="item.status=== 2" @click="deleteUnlinked">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon class="red--text">mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Delete Unlinked Transaction</span>
          </v-tooltip>
        </template>
        <template v-slot:item.description="props">
          <v-edit-dialog :return-value.sync="props.item.description" @save="save" @cancel="cancel" @open="open" @close="close" >
            {{ props.item.description }}
            <template v-slot:input> <v-text-field v-model="props.item.description" :rules="[max25chars]" label="Edit" single-line counter ></v-text-field> </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.category="props">
          <v-edit-dialog :return-value.sync="props.item.category" @save="save" @cancel="cancel" @open="open" @close="close" >
            {{ props.item.category }}
            <template v-slot:input>
              <v-autocomplete :items="categories" v-model="props.item.category " />
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.bucketString="props">
          <v-edit-dialog  @save="save" @cancel="cancel" @open="clickedTransactionBuckets(props.item)" @close="close">
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
                  <v-edit-dialog @save="modifiedTransactionBucketName">
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
                      <span style="margin-left: auto; margin-right: 0" :class="currentExpected === currentNet ? 'green--text' : 'red--text'">{{asCurrency(currentExpected-currentNet)}} </span>
                    </v-col>
                  </v-row>
                </template>
              </v-data-table>
            </template>

            <v-tooltip v-for="bucket in props.item.buckets" :key="bucket.id" bottom>
              <template #activator="{ on }">
                <v-chip dense v-on="on" outlined class="mr-1">{{bucket.name}}</v-chip>
              </template>
              {{asCurrency(bucket.amount)}}
            </v-tooltip>
          </v-edit-dialog>
        </template>
        <template v-slot:item.amount="{ item }">
          <span v-if="item.amount> 0" class="green--text">{{item.amountCurr}}</span>
          <span v-if="item.amount < 0" class="red--text">{{item.amountCurr}}</span>
          <span v-if="item.amount == 0.0" class="blue--text">{{item.amountCurr}}</span>
        </template>
        <template v-slot:item.date =" { item }">
          <v-edit-dialog>
            <template v-slot:input>
              <v-date-picker v-model="item.dateMills"></v-date-picker>
            </template>
            <span>{{item.date}}</span>
          </v-edit-dialog>

        </template>
      </v-data-table>
      <v-snackbar v-model="snack" :timeout="3000" :color="snackColor" >
        {{ snackText }}
        <template v-slot:action="{ attrs }"> <v-btn v-bind="attrs" text @click="snack = false" > Close </v-btn> </template>
      </v-snackbar>
    </v-container>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: "Dashboard",
  computed: {

  },

  methods: {
    formattedDate(input) {   // thanks, https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
      const date = new Date(parseInt(input))
      var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
      return monthNames[date.getMonth()] + " " + date.getDate() + ", " + (1900 + date.getYear())
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
          id: this.nextBucketID,
          name: tb.bucket.name,
          amount: tb.bucket_amount,
          priorityName: tb.bucket.priority.name,
          priorityLevel: tb.bucket.priority.level,
        })
        bucketString += tb.bucket.name
        this.nextBucketID++
      })
      return {buckets, bucketString}
    },

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

    transactionClicked(event) {
      console.log("clicked", event)
    },

    updateData() {
      this.updateTransactions()
      this.categories = this.categoriesQuery.map(cat => cat.name)
      this.buckets = this.bucketsQuery.map(bkt => bkt.name)
      console.log(this.buckets )
      console.log(this.transactions )
    },

    updateTransactions() {
      console.log("Loading Transactions")
      this.transactions = []
      for (const transaction of this.transactionsQuery) {
        const bucketInfo = this.transactionBuckets(transaction)
        this.transactions.push({
          id: transaction.id,
          description: transaction.description,
          date: this.formattedDate(transaction.date),
          dateMills: new Date(parseInt(transaction.date)).toISOString().substr(0, 10),
          category: transaction.category.name,
          bucketString: bucketInfo.bucketString,
          buckets: bucketInfo.buckets,
          status: transaction.status.id,
          statusEnum: this.transactionStatus(transaction),
          amount: this.transactionAmount(transaction),
          amountCurr: this.asCurrency(this.transactionAmount(transaction)),
        })
      }
      this.loading=false
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    deleteUnlinked(event) {
      console.log("clicked", event)
    },

    addBucket(event) {
      console.log(event)
    },

    save (event) {
      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Data saved'
      console.log(event)
    },
    cancel () {
    },
    open () {
    },
    close () {
      console.log('Dialog closed')
    },

    clickedAddTransactionBucket () {
      this.currentTransaction.buckets.push({
        id: this.nextBucketID,
        name: '',
        amount: 0,
        priorityName: '',
        priorityLevel: 0,
      })
      this.nextBucketID++
    },

    deleteTransactionBuckets() {
      console.log(this.selectedBuckets)

      this.currentTransaction.buckets = this.currentTransaction.buckets.filter(bkt => this.selectedBuckets.filter(selectedBkt => selectedBkt.id === bkt.id).length > 0)
    },

    modifiedTransactionBucketAmount() {
      var sum = 0
      this.currentTransaction.buckets.forEach(b => sum += parseFloat(b.amount))
      this.currentNet = sum
      console.log("modified", this.currentNet)
    },

    modifiedTransactionBucketName() {
      this.currentTransaction.bucketString = ""
      this.currentTransaction.buckets.forEach(bkt => {
        this.currentTransaction.bucketString += bkt.name
      })
    },

    clickedTransactionBuckets (transaction) {
      console.log(transaction)
      this.currentTransaction = transaction
      this.currentExpected = transaction.amount
      this.modifiedTransactionBucketAmount()
      console.log(transaction.amount)
    },




    clickedBucketRow(val) {
      console.log(val)
    }
  },

  mounted: function() {
    this.loading=true
    console.log('before')
    this.sleep(300)
        .then(this.updateData)
    console.log('after')
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
      query: gql`
      {
        bucketsQuery: buckets {
          name
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
      bucketsQuery: [],
      selectedBuckets: [],
      nextBucketID:  0,

      loading: true,
      transactionHeaders: [
        {text: "", value: "statusEnum"},
        {text: "Description", value: "description"},
        {text: "Category", value: "category"},
        {text: "Bucket", value: "bucketString"},
        {text: "Amount", value: "amount"},
        {text: "Date", value: "date"},
        {text: "Date", value: "dateMills", align: ' d-none'},
      ],
      bucketHeaders: [
        {text: "Bucket", value: "name"},
        {text: "Amount", value: "amount"},
      ],
      filter: '',
      selected: [],
      max25chars: v => v.length <= 25 || 'Input too long!',
      snackText: '',
      snackColor: '',
      snack: false,
      currentNet: 100,
      currentExpected: 100
    }
  }
}
</script>