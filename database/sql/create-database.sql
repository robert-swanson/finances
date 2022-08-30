CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY ,
    name VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS transaction (
    id SERIAL PRIMARY KEY ,
    description VARCHAR(64),
    category_id INT REFERENCES category (id)
);

CREATE TABLE IF NOT EXISTS account (
    id SERIAL PRIMARY KEY ,
    name VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS micro_transaction (
    id SERIAL PRIMARY KEY ,
    transaction_id INT REFERENCES transaction (id),
    date DATE,
    account_id INT REFERENCES account (id)
);

CREATE TABLE IF NOT EXISTS tag (
    id SERIAL PRIMARY KEY ,
    name VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS transaction_tag (
    transaction_id INT REFERENCES transaction (id),
    tag_id INT REFERENCES tag (id)
);
