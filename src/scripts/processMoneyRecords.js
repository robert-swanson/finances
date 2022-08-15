
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

let processCSV = async (csv, earliestDate) => {

    // const tweets = await Tweet.query().select(
    //     'Tweet.*',
    //     Tweet.relatedQuery('likes')
    //         .count()
    //         .as('numberOfLikes')
    // );

    const accounts = await Account.query()

    var statements;
    if (earliestDate) {
        statements = await Statement.query().where('date', '>=', earliestDate)
    } else {
        statements = await Statement.query()
    }
    const aliases = await Account.query()

    console.log(statements)
    console.log(accounts)
    console.log(aliases)
    csv.forEach(newStatement => {
        const newDate = new Date(newStatement.Date)
        if (earliestDate === undefined || earliestDate <= newDate) {
            var alreadyExists = false

            statements.forEach(oldStatement => {
                const oldDate = new Date(oldStatement.date)
                if (!alreadyExists && oldDate.getTime() === newDate.getTime() && oldStatement.Description === newStatement.Description) {
                    const oldAmount = parseFloat(newStatement.amount)
                    const newEarned = parseFloat(oldStatement.Earned.substring(1))
                    const newPaid = parseFloat(oldStatement.Paid.substring(1)) * -1

                    if (oldAmount === newEarned || oldAmount === newPaid) {
                      alreadyExists = true
                    }
                }
            })
        }
    })

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
