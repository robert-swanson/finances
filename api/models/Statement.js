const { Model } = require("objection");


class Statement extends Model {
    static get tableName() {
        return 'Statement'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['description', 'account_id', 'date', 'amount'],
            properties: {
                id: { type: 'integer' },
                description: { type: 'string', maxLength: 64},
                account_id: { type: 'integer' },
                date: { type: 'string'},
                category: { type: 'string', maxLength: 64},
                amount: { type: 'number' },
            }
        }
    }

    static get relationMappings() {
        const Account = require("./Account");
        const StatementTransaction = require("./StatementTransaction");
        const Transaction = require("./Transaction");

        return {
            account: {
                relation: Model.HasOneRelation,
                modelClass: Account,
                join: {
                    from: 'Statement.id',
                    to: 'Account.id'
                }
            },
            statementTransaction: {
                relation: Model.HasManyRelation,
                modelClass: StatementTransaction,
                join: {
                    from: 'Statement.id',
                    to: 'StatementTransaction.statement_id'
                }
            },
            transaction: {
                relation: Model.ManyToManyRelation,
                modelClass: Transaction,
                join: {
                    from: 'Statement.id',
                    through: {
                        from: 'StatementTransaction.statement_id',
                        to: 'StatementTransaction.transaction_id'
                    },
                    to: 'Transaction.id'
                }
            }
        }
    }
}

module.exports = Statement;
