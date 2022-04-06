// Dependencies
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const fs = require('fs')
const spdy = require('spdy')
const path = require('path')

dotenv.config()
// Routes
const { employeeRouter } = require('./routes/employees')
const { skillsRouter } = require('./routes/skills')
const { profileRouter } = require('./routes/profile')

// Initialise app and middleware
const app = express()
app.use(bodyParser.json())
app.use(morgan('dev'))

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

 Azure certs:
  cert: fs.readFileSync('/var/ssl/certs/901C65977AC7CD872442CACB865D01B94F9C699F.der'),
        key: fs.readFileSync('/var/ssl/private/901C65977AC7CD872442CACB865D01B94F9C699F.pfx'),
*/
console.log('----------Certificate and key directory contents: ---------')
console.log('Certificate Directory:')
console.log(fs.readdirSync('/var/ssl/certs'))
console.log('Key Directory:')
console.log(fs.readdirSync('/var/ssl/private'))
console.log('-----------------------------------------------------------')

spdy.createServer(
    {
        // cert: fs.readFileSync('/var/ssl/certs/18201CB636B958839C512D485B6BBCE47DF2721B.der'),
        // pfx: fs.readFileSync('/var/ssl/private/18201CB636B958839C512D485B6BBCE47DF2721B.p12'),
        pfx: fs.readFileSync('/var/ssl/private/18201CB636B958839C512D485B6BBCE47DF2721B.p12'),
        passphrase: '1234',
    },

    app
).listen(process.env.PORT, (err) => {
    if (err) {
        console.error(err)
    }
    console.log('******listenting on port ', process.env.PORT)
})
