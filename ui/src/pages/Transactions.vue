
<template>
  <v-container>
    <v-container>
      <v-data-table :headers="transactionHeaders" :items="transactions">
        <template v-slot:body="{ items : transactions }">
          <tbody>
            <tr v-for="transaction in transactions" :key="transaction.id" :class="{'lime lighten-4': transaction.status.id === 1}" style="{'color: blue':true}" @click="transactionClicked">
              <td>{{formattedDate(transaction.date)}}</td>
              <td>{{transaction.description}}</td>
              <td>{{transaction.category.name}}</td>
              <td>{{transactionBuckets(transaction)}}</td>
              <td v-if="transactionAmount(transaction) > 0" class="green--text">{{asCurrency(transactionAmount(transaction))}}</td>
              <td v-if="transactionAmount(transaction) < 0" class="red--text">{{asCurrency(transactionAmount(transaction))}}</td>
              <td v-if="transactionAmount(transaction) === 0" class="blue--text">{{asCurrency(transactionAmount(transaction))}}</td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
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
    async onClicked(){
      console.log(this.newBookName)
    },
    formattedDate: function(input) {   // thanks, https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
      const date = new Date(parseInt(input))
      var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
      return monthNames[date.getMonth()] + " " + date.getDate() + ", " + (1900 + date.getYear())
    },

    transactionAmount: function(transaction) {
      var amount = 0
      transaction.statementTransaction.forEach(prtAmt => amount+=prtAmt.partial_amount)
      return amount
    },

    transactionBuckets: function(transaction) {
      const buckets = transaction.transactionBucket.map(tb => tb.bucket.name)
      console.log(buckets)
      if (buckets.length === 1 ) {
        return buckets[0]
      } else {
        return buckets.length + " buckets"
      }
    },

    asCurrency: function(num) {
      if (num < 0) {
        return "- $"+(-1*num).toFixed(2)
      } else {
        return "$"+num.toFixed(2)
      }
    },

    transactionClicked(event) {
      console.log("clicked", event)
    }
  },

  // mounted: function() {
  //   this.getTransactions()
  // },

  apollo: {
    transactions: gql`

query transactions {
  transactions {
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
      bucket_amount
      bucket {
        name
      }
    }
  }
}

    `,
  },

  data: function() {
    return {
      net: 3141.15,
      reflectionDate: "1/12/21",
      newBookName: "",
      transactions: [],
      transactionHeaders: [
        {text: "Date", value: "date"},
        {text: "Description", value: "description"},
        {text: "Category", value: "category"},
        {text: "Bucket", value: "buckets"},
        {text: "Amount", value: "amount"}
      ]
    }
  }
}
</script>
