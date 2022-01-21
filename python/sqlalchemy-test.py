import pprint

import math

import databaseConnect
import sqlalchemy
from sqlalchemy import MetaData
from sqlalchemy import Table, Column, Integer, String, Date
from sqlalchemy import ForeignKey
from sqlalchemy.orm import registry
from sqlalchemy import insert, select
import pandas as pd

def main():
    addMoneyRecordsCSV()

    # tables = getTables()
    # transactionTable = tables['Transaction']
    # selectStmt = select(transactionTable.c.description)
    # for row in session.execute(selectStmt):
    #     print(row.description)


def parseCurr(val):
    if type(val) == float and not math.isnan(val):
        return val
    elif type(val) == str:
        return float(val[1:])
    else:
        return None

def getAccou

def addStatement(description, accountAlias, date, category, amount):
    pass


def addMoneyRecordsCSV():
    df = pd.read_csv("../export/money-records.csv")
    # print(pprint.pprint(df))
    for index, row in df.iterrows():
        date = row['Date']
        earned = parseCurr(row['Earned'])
        paid = parseCurr(row['Paid'])
        category=row['Category']
        destination = row['Destination']
        source = row['Source']

        pprint.pprint(row)

        if earned is not None:
            print("earned {}\n".format(earned))
        if paid is not None:
            print("paid {}\n".format(paid))


        input()
    return df


def getTables():
    tables = {}
    meta = MetaData()
    tableNames = ['statementtransaction','Statement', 'Transaction',
                  'Account', 'Status', 'Category', 'TransactionBucket',
                  'BucketHolding', 'Bucket', 'MonthBudget', 'Month',
                  'Priority', 'AccountAlias']
    tableNames = ['Transaction']
    for tableName in tableNames:
        tables[tableName] = Table(tableName, meta, autoload_with=engine)
    return tables

if __name__ == '__main__':
    engine, session = databaseConnect.connectSQLAlchemy()
    try:
        main()
        pass
    finally:
        if session is not None:
            session.close()
