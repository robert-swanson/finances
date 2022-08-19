const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs')
const graphQlBuilder = require('objection-graphql').builder;
const {GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLBoolean,
    GraphQLList, printSchema, GraphQLFloat
} = require('graphql');
const { Model } = require('objection');
const Knex = require('knex');

const Account = require("./models/Account");
const AccountAlias = require("./models/AccountAlias");
const Bucket = require("./models/Bucket");
const BucketHolding = require("./models/BucketHolding");
const Category = require("./models/Category");
const CategoryRule = require("./models/CategoryRule");
const Month = require("./models/Month");
const MonthBudget = require("./models/MonthBudget");
const Priority = require("./models/Priority");
const RuleColumn = require("./models/RuleColumn");
const RuleConstraint = require("./models/RuleConstraint");
const Statement = require("./models/Statement");
const StatementTransaction = require("./models/StatementTransaction");
const Status = require("./models/Status");
const Transaction = require("./models/Transaction");
const TransactionBucket = require("./models/TransactionBucket");

// Knex
const knex = Knex({
    client: "pg",
    connection: {
        host: "calentha", // PostgreSQL server
        user: "pi", // Your user name
        password: "rob@SecuringUpCalentha", // Your password
        database: "pi" // Your database name
    }
});


const mutationType = new GraphQLObjectType({
    name: 'RootMutationType',
    description: 'Domain API actions',
    fields: () => ({
        createAccount: {
            description: 'Creates a new account',
            type: GraphQLInt,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                active: { type: GraphQLBoolean },
                aliases: { type: new GraphQLList(new GraphQLNonNull(GraphQLString))}
            },
            resolve: async (root, input) => {
                const {name, active, aliases} = input
                const accountResult = await Account.query().insert({name, active})
                for (const alias of aliases) {
                    await AccountAlias.query().insert({account_id: accountResult.id, alias})
                }
                return accountResult.id;
            },
        },
        editDescription: {
            description: 'Edits the description of a transaction',
            type: GraphQLInt,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt)},
                description: { type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (root, input) => {
                const {id, description} = input
                return Transaction.query().findById(id).patch({description});
            },
        },
        confirmTransaction: {
            description: 'Confirms a transaction',
            type: GraphQLInt,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: async (root, input) => {
                const {id} = input
                return Transaction.query().findById(id).patch({status_id: 3});
            },
        },
        editCategory: {
            description: 'Edits the category of a transaction',
            type: GraphQLInt,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt)},
                category: { type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (root, input) => {
                const {id, category} = input
                const category_id = await Category.query().select('id', 'name').where('name', '=', category)
                console.log(category_id)
                if (category_id.length !== 1) {
                    console.error("Couldn't Match Category: " + category_id.length)
                } else {
                    console.log(category_id[0].id)
                    console.log(await Transaction.query().findById(id).select("description"))
                    const rv = await Transaction.query().findById(id).patch({category_id: category_id[0].id});
                    console.log("Success: " + rv)
                }
            },
        },
        setTransactionBuckets: {
            description: 'For a given transaction, clears the buckets and adds the provided buckets',
            type: GraphQLInt,
            args: {
                transaction_id: { type: new GraphQLNonNull(GraphQLInt)},
                buckets: { type: new GraphQLNonNull(new GraphQLList(
                    new GraphQLInputObjectType({
                        name: 'UniqueName',
                        fields: {
                            bucket_id: { type: new GraphQLNonNull(GraphQLInt) },
                            bucket_amount: { type: new GraphQLNonNull(GraphQLFloat) },
                        }
                    })))}
            },
            resolve: async (root, input) => {
                const {transaction_id, buckets} = input
                var inserts = 0

                await TransactionBucket.query().delete().where('transaction_id', '=', transaction_id)

                for (const bucket of buckets) {
                    const inserted = await TransactionBucket.query().insert({
                        transaction_id: transaction_id,
                        bucket_id: bucket.bucket_id,
                        bucket_amount: bucket.bucket_amount
                    })
                    if (inserted !== null) {
                        inserts++
                    }
                }
                console.log("Inserted " + inserts + " buckets")
                return inserts
            },
        },
        editDate: {
            description: 'Edits the date of a transaction',
            type: GraphQLInt,
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt)},
                date: { type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (root, input) => {
                const {id, date} = input
                return Transaction.query().findById(id).patch({date});
            },
        },
        mergeTransactions: {
            description: 'Merges the transactions specified by the list of transaction IDs',
            type: GraphQLInt,
            args: {
                ids: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLInt)))}
            },
            resolve: async (root, input) => {
                const {ids} = input
                var transactions = await Transaction.query().findByIds(ids)
                var description = "Merge: " + transactions.map(t => "'" + t.description + "'").join(", ")
                if (description.length > 64) {
                    description = description.substr(0, 61) + "..."
                }
                let date = transactions.map(t => t.date).sort((a,b) => {a > b})[0].toISOString()
                let category_id = transactions[0].category_id
                let newTransaction = await Transaction.query().insert({status_id: 1, category_id, description, date})
                let transaction_id = newTransaction.id
                console.log("Merged: " + description)

                for (let old_id of ids) {
                    console.log("Processing " + old_id)
                    //Update Statement Transaction
                    await StatementTransaction.query().patch({transaction_id}).where('transaction_id', old_id)

                    //Update Transaction Buckets
                    await TransactionBucket.query().patch({transaction_id}).where('transaction_id', old_id)

                    //Remove Old Transactions
                    await Transaction.query().delete().where('id', old_id)
                }


                return transaction_id
            }
        }

    //    Need to make query to delete and create (maybe selectivly update instead) transactionBuckets
    }),
});

// Objection
Model.knex(knex);
const models = [ Account, AccountAlias, Bucket, BucketHolding, Category, CategoryRule, Month, MonthBudget, Priority, RuleColumn, RuleConstraint, Statement, StatementTransaction, Status, Transaction, TransactionBucket ]
const graphQLSchema = graphQlBuilder().allModels(models).extendWithMutations(mutationType).build()

fs.writeFile('graphql-schema.graphql', printSchema(graphQLSchema), err => {
    if (err) {
        console.error(err)
        return
    }
})

// Apollo
const server =
    new ApolloServer({
        schema: graphQLSchema,
        playground: {
            settings: {
                'editor.theme': 'light',
            },
        },
    });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});


// Express Server https://www.bezkoder.com/node-js-express-file-upload/

const cors = require("cors");
const express = require("express");
const app = express();
global.__basedir = __dirname;
var corsOptions = {
    origin: "http://localhost:8080"
};
app.use(cors(corsOptions));
const initRoutes = require("./src/express/routes");
app.use(express.urlencoded({ extended: true }));
initRoutes(app);
let port = 8081;
app.listen(port, () => {
    console.log(`📁 Express Server running at localhost:${port}`);
});