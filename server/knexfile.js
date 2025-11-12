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
  },

  production: {
    client: 'pg', // PostgreSQL client
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      // For Cloud Run, connect via a Unix socket
      host: process.env.DB_HOST,
    },
    migrations: {
      directory: './db/migrations'
    }
  }

};
