// Dependencies
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.PORT || 8080
// Routes
const { employeeRouter } = require('./routes/employees')
const { skillsRouter } = require('./routes/skills')
const { profileRouter } = require('./routes/profile')
const { analyticsRouter } = require('./routes/analytics')
const { pool } = require('./db/db')

// Initialise app and middleware
const app = express()
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cors())

// Register routes
app.use('/employees', employeeRouter)
app.use('/skills', skillsRouter)
app.use('/profile', profileRouter)
app.use('/analytics', analyticsRouter)
// TODO: Analytics - get raw data
/*
 - Number of people with a particular skill/combination of skills
 - Number of people who have updated records by a date and opposite
 - List of accounts that have or haven't been updated (and their details incl managers)
 - CSV file with all data
*/

app.listen(port, async () => {
    console.log('connecting to database...')
    try {
        await pool.connect()
        console.log('listening on port: ' + port)
    } catch (err) {
        console.warn(err)
        process.exit()
    }
})
