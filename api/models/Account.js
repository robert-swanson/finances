const { Model } = require("objection");

class Account extends Model {
    static get tableName() {
        return 'Account'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'active'],
            properties: {
                id: { type: 'integer' },
                name: { type: 'string', maxLength: 64},
                active: { type: 'boolean'}
            }
        }
    }

    static get relationMappings() {
        const Statement = require("./Statement");
        const AccountAlias = require("./AccountAlias");
        const BucketHolding = require("./BucketHolding");
        const Bucket = require("./Bucket");

        return {
            statement: {
                relation: Model.HasManyRelation,
                modelClass: Statement,
                join: {
                    from: 'Account.id',
                    to: 'Statement.id'
                }
            },
            accountAlias: {
                relation: Model.HasOneRelation,
                modelClass: AccountAlias,
                join: {
                    from: 'Account.id',
                    to: 'AccountAlias.account_id'
                }
            },
            bucketHolding: {
                relation: Model.HasManyRelation,
                modelClass: BucketHolding,
                join: {
                    from: 'Account.id',
                    to: 'BucketHolding.account_id'
                }
            },
            bucketsHeld: {
                relation: Model.ManyToManyRelation,
                modelClass: Bucket,
                join: {
                    from: 'Account.id',
                    through: {
                        from: 'BucketHolding.account_id',
                        to: 'BucketHolding.bucket_id'
                    },
                    to: 'Bucket.id'
                }
            }
        }
    }
}

module.exports = Account;
