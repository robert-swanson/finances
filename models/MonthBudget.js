const { Model } = require("objection");


class MonthBudget extends Model {
    static get tableName() {
        return 'MonthBudget'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['bucket_id', 'month_id', 'priority_id'],
            properties: {
                id: { type: 'integer' },
                bucket_id: { type: 'integer' },
                month_id: { type: 'integer' },
                constant: { type: 'number' },
                percent: { type: 'number', minimum: 0, maximum: 1},
            }
        }
    }

    static get relationMappings() {
        const Bucket = require("./Bucket")
        const Month = require("./Month");
        const Priority = require("./Priority");

        return {
            bucket: {
                relation: Model.HasOneRelation,
                modelClass: Bucket,
                join: {
                    from: 'MonthBudget.bucket_id',
                    to: 'Bucket.id'
                }
            },
            month: {
                relation: Model.HasOneRelation,
                modelClass: Month,
                join: {
                    from: 'MonthBudget.month_id',
                    to: 'Month.id'
                }
            },
            priority: {
                relation: Model.HasOneRelation,
                modelClass: Priority,
                join: {
                    from: 'MonthBudget.bucket_id',
                    join: {
                        from: 'Bucket.id',
                        to: 'Bucket.priority_id'
                    },
                    to: 'Priority.id'
                }
            },
        }
    }
}

module.exports = MonthBudget;
