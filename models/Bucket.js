const { Model } = require("objection");

class Bucket extends Model {
    static get tableName() {
        return 'Bucket'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'priority_id'],
            properties: {
                id: { type: 'integer' },
                name: { type: 'string', maxLength: 64},
                priority_id: { type: 'integer' },
            }
        }
    }

    static get relationMappings() {
        const Transaction = require("./Transaction");
        const TransactionBucket = require("./TransactionBucket");
        const BucketHolding = require("./BucketHolding");
        const Account = require("./Account");
        const MonthBudget = require("./MonthBudget");
        const Priority = require("./Priority");

        return {
            transactionBucket: {
                relation: Model.HasManyRelation,
                modelClass: TransactionBucket,
                join: {
                    from: 'Bucket.id',
                    to: 'TransactionBucket.bucket_id'
                }
            },
            transaction: {
                relation: Model.ManyToManyRelation,
                modelClass: Transaction,
                join: {
                    from: 'Bucket.id',
                    through: {
                        from: 'TransactionBucket.bucket_id',
                        to: 'TransactionBucket.transaction_id',
                    },
                    to: 'Transaction.id'
                }
            },
            bucketHolding: {
                relation: Model.HasManyRelation,
                modelClass: BucketHolding,
                join: {
                    from: 'Bucket.id',
                    to: 'BucketHolding.bucket_id'
                }
            },
            bucketHoldingAccounts: {
                relation: Model.ManyToManyRelation,
                modelClass: Account,
                join: {
                    from: 'Bucket.id',
                    through: {
                        from: 'BucketHolding.bucket_id',
                        to: 'BucketHolding.account_id',
                    },
                    to: 'Account.id'
                }
            },
            monthBudget: {
                relation: Model.HasManyRelation,
                modelClass: MonthBudget,
                join: {
                    from: 'Bucket.id',
                    to: 'MonthBudget.bucket_id'
                }
            },
            priority: {
                relation: Model.HasOneRelation,
                modelClass: Priority,
                join: {
                    from: 'Bucket.priority_id',
                    to: 'Priority.id'
                }
            }
        }
    }
}

module.exports = Bucket;
