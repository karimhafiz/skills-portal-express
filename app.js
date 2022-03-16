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

app.listen(8000, () => {
    console.log('listening')
})