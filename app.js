// Dependencies
const express = require("express");
const morgan = require("morgan")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
dotenv.config()
// Routes
const {employeeRouter} = require('./routes/employees')
const { skillsRouter } = require('./routes/skills')
const {profileRouter} = require('./routes/profile')

// Initialise app and middleware
const app = express()
app.use(bodyParser.json())
app.use(morgan("dev"))

// Register routes
app.use('/employees', employeeRouter)
app.use('/skills', skillsRouter)
app.use('/profile', profileRouter)
// TODO: Analytics - get raw data
/*
 - Number of people with a particular skill/combination of skills
 - Number of people who have updated records by a date and opposite
 - List of accounts that have or haven't been updated (and their details incl managers)
 - CSV file with all data
*/

app.listen(8000, () => {
    console.log('listening')
})