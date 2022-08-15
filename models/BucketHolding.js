const { Model } = require("objection");

class BucketHolding extends Model {
    static get tableName() {
        return 'BucketHolding'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['account_id', 'bucket_id', 'minimum_percent_holding'],
            properties: {
                account_id: { type: 'integer' },
                bucket_id: { type: 'integer' },
                minimum_percent_holding: { type: 'number' , minimum: 0, maximum: 1},
            }
        }
    }
}

module.exports = BucketHolding;
