const { Model } = require("objection");


class RuleColumn extends Model {
    static get tableName() {
        return 'RuleColumn'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name'],
            properties: {
                id: { type: 'integer' },
                name: { type: 'string', maxLength: 64},
            }
        }
    }
}

module.exports = RuleColumn;
