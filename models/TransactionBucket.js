const { Model } = require("objection");


class TransactionBucket extends Model {
    static get tableName() {
        return 'TransactionBucket'
    }

    static get idColumn() {
        return ['transaction_id', 'bucket_id'];
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['transaction_id', 'bucket_id', 'bucket_amount'],
            properties: {
                transaction_id: { type: 'integer' },
                bucket_id: { type: 'integer' },
                bucket_amount: { type: 'number'}
            }
        }
    }

    static get relationMappings() {
        const Bucket = require("./Bucket");

        return {
            bucket: {
                relation: Model.HasOneRelation,
                modelClass: Bucket,
                join: {
                    from: 'TransactionBucket.bucket_id',
                    to: 'Bucket.id'
                }
            },
        }
    }
}

module.exports = TransactionBucket;
