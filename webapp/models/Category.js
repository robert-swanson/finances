const { Model } = require("objection");

class Category extends Model {
    static get tableName() {
        return 'Category'
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

module.exports = Category;
