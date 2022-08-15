const { Model } = require("objection");

class StatementTransaction extends Model {
    static get tableName() {
        return 'StatementTransaction'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['statement_id', 'transaction_id', 'partial_amount'],
            properties: {
                id: { type: 'integer' },
                statement_id: { type: 'integer' },
                transaction_id: { type: 'integer' },
                note: { type: 'string', maxLength: 64},
                partial_amount: { type: 'integer' },
            }
        }
    }

    static get relationMappings() {
        const Statement= require("./Statement");
        const Transaction = require("./Transaction");

        return {
            statement: {
                relation: Model.HasOneRelation,
                modelClass: Statement,
                join: {
                    from: 'StatementTransaction.statement_id',
                    to: 'Statement.id'
                }
            },
            transaction: {
                relation: Model.HasOneRelation,
                modelClass: Transaction,
                join: {
                    from: 'StatementTransaction.transaction_id',
                    to: 'Transaction.id'
                }
            }
        }
    }
}

module.exports = StatementTransaction;
