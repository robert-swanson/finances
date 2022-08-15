const { Model } = require("objection");



class RuleConstraint extends Model {
    static get tableName() {
        return 'RuleConstraint'
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

module.exports = RuleConstraint;
