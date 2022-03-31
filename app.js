// Dependencies
const express = require("express");
const morgan = require("morgan")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const fs = require('fs')
const spdy = require('spdy')
const path = require('path')

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

spdy.createServer({
    key: fs.readFileSync(path.join(__dirname, './certificates/privateKey.key')),
    cert: fs.readFileSync(path.join(__dirname, './certificates/certificate.crt'))
}, app).listen(process.env.port, (err) => {
    if(err) {
        console.error(err)
    }
    console.log('listenting on port ', process.env.PORT)
})