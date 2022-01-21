const { ApolloServer, gql } = require('apollo-server');
const graphQlBuilder = require('objection-graphql').builder;
const {GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLBoolean,
    GraphQLList
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
    }),
});






// Objection
Model.knex(knex);
const models = [ Account, AccountAlias, Bucket, BucketHolding, Category, CategoryRule, Month, MonthBudget, Priority, RuleColumn, RuleConstraint, Statement, StatementTransaction, Status, Transaction, TransactionBucket ]
const graphQLSchema = graphQlBuilder().allModels(models).extendWithMutations(mutationType).build()


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

