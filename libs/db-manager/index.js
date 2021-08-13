const mysql = require('mysql');

/////////////////// MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL ///////////////////
/////////////////// MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL ///////////////////
/////////////////// MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL ///////////////////
/////////////////// MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL ///////////////////
/////////////////// MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL ///////////////////
/////////////////// MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL MYSQL ///////////////////
/** 
 * Represents the connection with a MySQL db.
 * @param {object} config - An object containing host, user, password and database.
 * @property {string} host - A string containing the host name (an IPv4 address).
 * @property {string} user - A string containing the username used to access the database.
 * @property {string} password - A string containing the password of the username.
 * @property {string} database - A satring containing the name of the database used to access.
 */
exports.MySQL_DB = class MySQL_DB {
    #config;
    #connection;
    
    /**
     * An object containing:
     * @property {string} host - A string containing the host name (or an IPv4 address).
     * @property {string} user - A string containing the username used to access the database.
     * @property {string} password - A string containing the password of the username.
     * @property {string} database - A satring containing the name of the database used to access.
     */
    constructor(config) {
        this.#config = config;
        this.#connection = undefined;

        this.#connect();
    }

    /**
     * Returns the datas of the configuration object.
     * @returns {object} An object containing the infos used for creating a connection with the dabase.
     */
    getConfig() {
        return this.#config;
    }

    /**
     * Set to a new value @property {object} config and recreate a new connection after closing the old one.
     * @param {object} config - An object containing:
     * @property {string} host - A string containing the host name (or an IPv4 address).
     * @property {string} user - A string containing the username used to access the database.
     * @property {string} password - A string containing the password of the username.
     * @property {string} database - A satring containing the name of the database used to access.
     */
    setConfig(config) {
        this.#config = config;

        this.end();
        this.#connect();
    }

    /** 
     * Create and start a connection with the database.
     */
    #connect() {
        this.#connection = mysql.createConnection(this.#config);
        this.#connection.connect(err => {
            if (err) {
                this.#error(err, 'Error while connecting to the database:');
                return;
            }

            console.log(`Connection to the database established. HOST = ${this.#config.host} | DB_NAME = ${this.#config.database}`);
        });   
    }

    /** 
     * Close the connection after finishing all the remaining querys. 
     */
    end() {
        this.#connection.end(err => {
            if (err) {
                this.#error(err, 'Error while closing the connection to the database:');
            }

            console.log('Connection to the database closed.');
        });
    }

    /** 
     * Force to close the connection interrupting all the querys. 
     */
    destroy() {
        this.#connection.destroy();
        console.log('Connection to the database interrupted.');
    }

    /** 
     * Insert one or more elements into a specified table. 
     * @param {string} table - A string containing the name of the table.
     * @param {object} toInsert - An object containing a series of item each for columns with the associated value.
     */
    insert(table, toInsert = {}) {
        let sql = `INSERT INTO ${table}(`;
        let data = [];

        for (const [key, value] of Object.entries(toInsert)) {
            sql += this.#connection.escapeId(key) + ', ';
            data.push(value);
        }

        sql = sql.slice(0, sql.length - 2) + ') VALUES(';

        for (let i = 0; i < data.length; i++) {
            if (i === data.length - 1) {
                sql += '?)';
            }
            else {
                sql += '?, ';
            }
        }

        this.#connection.query(sql, data, (err, results, fields) => {
            if (err) {
                this.#error(err, `Error while performing an insert action:\nACTION - ${sql}`);
            }
        });
    }

    /**
     * Select and get on or more elements from a cerain table. 
     * @param {string} table - A string containing the name of the table.
     * @param {object} where - An object containing a series of item with an associated value used to query the the elements.
     * @returns {object[]} A list of objects where every object contain a series of key: value, where the key is the name of the column and the value the record.
     */
    select(table, where = {}) {
        return new Promise((resolve, reject) => {
            let sql = `SELCT * FROM ${table} WHERE `;
            let data = [];

            for (const [key, value] of Object.entries(where)) {
                sql += this.#connection.escapeId(key) + '=?, ';
                data.push(value);
            }
            sql = sql.slice(0, sql.length - 2);

            this.#connection.query(sql, data, (err, results, fields) => {
                if (err) {
                    this.#error(err, `Error while performing a select action:\nACTION - ${sql}`);
                    reject(err);
                }

                resolve(results);
            });
        });
    }

    /**
     * Delete from the table all the rows that respect the passed parameters.
     * @param {string} table - A string containing the name of the table.
     * @param {object} where - An object containing a series of item with an associated value used to query the the elements.
     * @param {number} rowLimit - An integer containing the numbers of row to delete, default value is null. If null, undefined, 0 or anything different from a natural number is passed all the matching rows of the query will be removed.
     * @returns {mysql.OkPacket} An object containing infos about the query executed.
     */
    delete(table, where = {}, rowLimit = null) {
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM ${table} WHERE `;
            let data = [];

            for (const [key, value] of Object.entries(where)) {
                sql += this.#connection.escapeId(key) + '=?, ';
                data.push(value);
            }
            sql = sql.slice(0, sql.length - 2);
            
            if (Number.isInteger(rowLimit) && rowLimit > 0) {
                sql += ` LIMIT ${rowLimit}`;
            }

            this.#connection.query(sql, data, (err, results, fields) => {
                if (err) {
                    this.#error(err, `Error while performing a delete action:\nACTION - ${sql}`);
                    reject(err);
                }

                resolve(results);
            });
        });
    }

    /** 
     * Conctruct an easy to use error message. 
     * @param {mysql.MysqlError} err - The error object used.
     * @param {string} msg - A custom message to show before the error.
     * @param {boolean} throw_err - A boolean whatever you want to throw (true) or not (false) an error.
     */
    #error(err, msg = '', throw_err = false) {
        if (msg.length > 0) {
            console.error(msg);
        }

        if (throw_err) {
            throw err;
        }
        else {
            console.error(err.code);
            console.error(err.message);
            console.error(err.stack);
        }
    }
}


/////////////////// OTHERDB OTHERDB OTHERDB OTHERDB OTHERDB OTHERDB OTHERDB OTHERDB OTHERDB OTHERDB OTHERDB ///////////////////