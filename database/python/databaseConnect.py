#!/usr/bin/python

import psycopg2
from configparser import ConfigParser
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import urllib.parse


def getArgs(configFilename='database.ini', section='postgresql'):
    parser = ConfigParser()
    parser.read(configFilename)

    parameters = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            parameters[param[0]] = urllib.parse.quote_plus(param[1])
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, configFilename))
    return parameters


def connectSQLAlchemy():
    args = getArgs()
    url = 'postgresql://{}:{}@{}/{}'.format(args['user'], args['password'], args['host'], args['database'])
    engine = create_engine(url, echo=False, future=True)
    session = Session(engine)
    return engine, session


def connect():
    try:
        print('Connecting to the PostgreSQL database...')
        conn = psycopg2.connect(**getArgs())
        conn.cursor().execute('SET search_path = "finance";')
        return conn
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)


