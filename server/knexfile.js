// @ts-check

/**
 * @type { import('knex').Knex.Config }
 */
module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/local.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    }
  }

};
