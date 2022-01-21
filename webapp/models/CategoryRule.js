const { Model } = require("objection");

class CategoryRule extends Model {
    static get tableName() {
        return 'CategoryRule'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['category_id', 'column_id', 'constraint_id', 'value'],
            properties: {
                id: { type: 'integer' },
                category_id: { type: 'integer' },
                column_id: { type: 'integer' },
                constraint_id: { type: 'integer' },
                value: { type: 'string', maxLength: 64},
            }
        }
    }

    static get relationMappings() {
        const Category = require("./Category");
        const RuleColumn = require("./RuleColumn");
        const RuleConstraint = require("./RuleConstraint");

        return {
            category: {
                relation: Model.HasOneRelation,
                modelClass: Category,
                join: {
                    from: 'CategoryRule.category_id',
                    to: 'Category.id'
                }
            },
            ruleColumn: {
                relation: Model.HasOneRelation,
                modelClass: RuleColumn,
                join: {
                    from: 'CategoryRule.column_id',
                    to: 'RuleColumn.id'
                }
            },
            ruleConstraint: {
                relation: Model.HasOneRelation,
                modelClass: RuleConstraint,
                join: {
                    from: 'CategoryRule.constraint_id',
                    to: 'RuleConstraint.id'
                }
            },
        }
    }
}

module.exports = CategoryRule;
