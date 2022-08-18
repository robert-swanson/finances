
const Account = require("../../models/Account");
const AccountAlias = require("../../models/AccountAlias");
const Bucket = require("../../models/Bucket");
const BucketHolding = require("../../models/BucketHolding");
const Category = require("../../models/Category");
const CategoryRule = require("../../models/CategoryRule");
const Month = require("../../models/Month");
const MonthBudget = require("../../models/MonthBudget");
const Priority = require("../../models/Priority");
const RuleColumn = require("../../models/RuleColumn");
const RuleConstraint = require("../../models/RuleConstraint");
const Statement = require("../../models/Statement");
const StatementTransaction = require("../../models/StatementTransaction");
const Status = require("../../models/Status");
const Transaction = require("../../models/Transaction");
const TransactionBucket = require("../../models/TransactionBucket");
// const dfd = import("danfojs")

let createNewAccount = name => {

}

let processCSV = async (csv, earliestDate) => {

    // const tweets = await Tweet.query().select(
    //     'Tweet.*',
    //     Tweet.relatedQuery('likes')
    //         .count()
    //         .as('numberOfLikes')
    // );


    var accounts = {}
    for (const account of await Account.query()) {
        accounts[account.name] = account.id
    }

    var categories = {}
    for (const category of await Category.query()) {
        categories[category.name] = category.id
    }

    var statements;
    if (earliestDate) {
        statements = await Statement.query().where('date', '>=', earliestDate)
    } else {
        statements = await Statement.query()
    }
    // const aliases = await Account.query()

    // console.log(statements)
    console.log(accounts)
    // console.log(aliases)
    for (const newStatement of csv) {
        if (newStatement.Description.trim() === "") continue;

        var date = new Date(newStatement.Date.trim()).toISOString()
        const description = newStatement.Description.trim()
        const category = newStatement.Category.trim()
        let category_id = categories[category]
        if (!category_id) {
            const new_category = await Category.query().insert({name: category})
            category_id = new_category.id
            categories[category] = category_id
        }

        console.log("Inserting Transaction: " + description)
        const new_transaction = await Transaction.query().insert({status_id: 1, category_id, description, date})
        const transaction_id = new_transaction.id

        const regex = /[^\d-\.]/ig;

        if (newStatement.Destination) {
            let account_id = accounts[newStatement.Destination]
            if (!account_id) {
                const new_account = await Account.query().insert({name: newStatement.Destination, active: true})
                account_id = new_account.id
                accounts[newStatement.Destination] = account_id
            }
            let amount = parseFloat(newStatement.Earned.replaceAll(regex, ''))
            // console.log("Inserting Income Statement\n\tdescription: " + description+ "\n\taccount id: " + account_id+ "(account name: "+ newStatement.Destination + ")\n\tdate: " + date + "\n\tcategory: " + category + "\n\tamount: " + amount + "\n" )
            let new_statement = await Statement.query().insert({ description, account_id, date, category, amount })
            let statement_id = new_statement.id

            let note = description + " (Income)"
            // console.log("Inserting Income StatementTransaction\n\tstatement_id: " + statement_id+ "\n\ttransaction_id: " + transaction_id + "\n\tnote: " + note + "\n\tpartial_amount: " + amount + "\n" )
            await StatementTransaction.query().insert({statement_id, transaction_id, note, partial_amount: amount})
        }

        if (newStatement.Source) {
            let account_id = accounts[newStatement.Source]
            if (!account_id) {
                const new_account = await Account.query().insert({name: newStatement.Source, active: true})
                account_id = new_account.id
                accounts[newStatement.Destination] = account_id
            }
            let amount = -1 * parseFloat(newStatement.Paid.replaceAll(regex, ''))
            // console.log("Inserting Expense Statement\n\tdescription: " + description+ "\n\taccount id: " + account_id+ "(account name: "+ newStatement.Source + ")\n\tdate: " + date + "\n\tcategory: " + category + "\n\tamount: " + amount + "\n" )
            let new_statement = await Statement.query().insert({ description, account_id, date, category, amount })
            let statement_id = new_statement.id

            let note = description + " (Expense)"
            // console.log("Inserting Expense StatementTransaction\n\tstatement_id: " + statement_id+ "\n\ttransaction_id: " + transaction_id + "\n\tnote: " + note + "\n\tpartial_amount: " + amount + "\n" )
            await StatementTransaction.query().insert({statement_id, transaction_id, note, partial_amount: amount})
        }
    }

}

let processMoneyRecords = (file) => {

    console.log("Processing Uploaded File: " + file)

    const csv = require('csv-parser')
    const fs = require('fs')
    const results = [];

    fs.createReadStream(file)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            processCSV(results)
        });


    return "Uploaded and Processed File: " + file
};

module.exports = processMoneyRecords
