const { Model } = require("objection");


class AccountAlias extends Model {
    static get tableName() {
        return 'AccountAlias'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['account_id', 'alias'],
            properties: {
                id: { type: 'integer' },
                account_id: { type: 'integer' },
                alias: { type: 'string', maxLength: 64},
            }
        }
    }
}

module.exports = AccountAlias;
