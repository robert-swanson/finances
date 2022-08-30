const { Model } = require("objection");


class Status extends Model {
    static get tableName() {
        return 'Status'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['description'],
            properties: {
                id: { type: 'integer' },
                description: { type: 'string', maxLength: 64},
            }
        }
    }
}

module.exports = Status;
