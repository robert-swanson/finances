#!/usr/bin/python
import pprint
import pandas as pd
import databaseConnect


def main(database):
    # cursor = database.cursor()
    # cursor.execute('SELECT * FROM transaction;')
    selectCategory = 'SELECT * FROM "Account";'
    table = pd.read_sql_query(selectCategory, database)
    pprint.pprint(table)


if __name__ == '__main__':
    database = databaseConnect.connect()
    try:
        main(database)
        pass
    finally:
        if database is not None:
            database.close()
            print('Database connection closed.')
