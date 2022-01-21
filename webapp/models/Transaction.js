const { Model } = require("objection");

class Transaction extends Model {
    static get tableName() {
        return 'Transaction'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['status_id', 'category_id', 'description', 'date'],
            properties: {
                id: { type: 'integer' },
                status_id: { type: 'integer' },
                category_id: { type: 'integer' },
                description: { type: 'string', maxLength: 64},
                date: { type: 'string', pattern: 'date'}
            }
        }
    }

    static get relationMappings() {
        const Statement= require("./Statement");
        const Status = require("./Status");
        const StatementTransaction = require("./StatementTransaction");
        const TransactionBucket = require("./TransactionBucket");
        const Bucket = require("./Bucket");
        const Category = require("./Category");

        return {
            statementTransaction: {
                relation: Model.HasManyRelation,
                modelClass: StatementTransaction,
                join: {
                    from: 'Transaction.id',
                    to: 'StatementTransaction.transaction_id'
                }
            },
            statement: {
                relation: Model.ManyToManyRelation,
                modelClass: Statement,
                join: {
                    from: 'Transaction.id',
                    through: {
                        from: 'StatementTransaction.transaction_id',
                        to: 'StatementTransaction.statement_id',
                    },
                    to: 'Statement.id'
                }
            },
            status: {
                relation: Model.HasOneRelation,
                modelClass: Status,
                join: {
                    from: 'Transaction.status_id',
                    to: 'Status.id'
                }
            },
            transactionBucket: {
                relation: Model.HasManyRelation,
                modelClass: TransactionBucket,
                join: {
                    from: 'Transaction.id',
                    to: 'TransactionBucket.transaction_id'
                }
            },
            buckets: {
                relation: Model.ManyToManyRelation,
                modelClass: Bucket,
                join: {
                    from: 'Transaction.id',
                    through: {
                        from: 'TransactionBucket.transaction_id',
                        to: 'TransactionBucket.bucket_id'
                    },
                    to: 'Bucket.id'
                }
            },
            category: {
                relation: Model.HasOneRelation,
                modelClass: Category,
                join: {
                    from: 'Transaction.category_id',
                    to: 'Category.id'
                }
            },
        }
    }
}

module.exports = Transaction;
