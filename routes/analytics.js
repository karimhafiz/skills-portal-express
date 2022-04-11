const express = require('express')
const { pool } = require('../db/db')

const analyticsRouter = express.Router()

// analyticsRouter.get('/employees-and-skills', (req, res) => {
//     pool.query(`
//     SELECT employees.id, firstname, lastname, country, email,  manager_id, employees_skills.updated_at, skill_name, skill_level
//     FROM employees
//     JOIN employees_skills
//         ON employees_skills.employee_id = employees.id
//     JOIN skills
//         ON skills.id = employees_skills.skill_id
//     `, (err, result) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             // create array of JSON objects
//             const jsonArray = result.rows.map(row => JSON.stringify(row))
//             converter.csv2json(jsonArray, (err, data) => {
//                 if (err) {
//                     console.warn(err)
//                     res.status(500).send(err)
//                 } else {

//                     res.status(200).send(data)
//                 }
//             })
//         }
//     })
// })

module.exports = {analyticsRouter}
