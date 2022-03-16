const { Pool } = require('pg')


const user = process.env.PGUSER
const host = process.env.PGHOST
const database = process.env.PGDATABASE
const password = process.env.PGPASSWORD
const port = 5432


const pool = new Pool({
    connectionString: `${process.env.PG_CONNECTION_STRING}`,
})

module.exports = {pool}