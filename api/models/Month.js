const { Model } = require("objection");

class Month extends Model {
    static get tableName() {
        return 'Month'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['year', 'month_num'],
            properties: {
                id: { type: 'integer' },
                year: { type: 'integer' },
                month_num: { type: 'integer' },
            }
        }
    }
}

module.exports = Month;
