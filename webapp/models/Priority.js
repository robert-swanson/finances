const { Model } = require("objection");


class Priority extends Model {
    static get tableName() {
        return 'Priority'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'level'],
            properties: {
                id: { type: 'integer' },
                name: { type: 'string', maxLength: 64},
                level: { type: 'integer' },
            }
        }
    }

}

module.exports = Priority;
