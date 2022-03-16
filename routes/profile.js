const express = require('express')
const { pool } = require('../db/db')
const _ = require('lodash')

const profileRouter = express.Router()

// Get the skills for a given employee ID
profileRouter.get('/:employeeID/skills', (req, res) => {
    const { employeeID } = req.params
    if (!employeeID) res.status(400).send('No employee ID specified')
    pool.query(
        `SELECT entry_uuid, employee_id, skill_name, skill_level FROM employees_skills
            LEFT JOIN skills
                ON skills.id = employees_skills.skill_id
            WHERE employee_id=$1`,
        [employeeID],
        (err, result) => {
            if (err) res.status(500).send(err)
            res.send(result.rows)
        }
    )
})

profileRouter.get('/:employeeID/evidence', (req, res) => {
    const { employeeID } = req.params
    if (!employeeID) res.status(400).send('No employee ID provided')
    
    pool.query(`SELECT entry_uuid, skill_name, evidence_url, description FROM employees_skills
                LEFT JOIN skills
                    ON skills.id = employees_skills.skill_id
                LEFT JOIN evidence
                    ON evidence.emp_skill_id = employees_skills.entry_uuid
                WHERE employee_id=$1`,
        [employeeID],
        (err, result) => {
            if (err) {
                res.status(500).send(err)
            } else if (result.rows === []) {
                res.send(result.rows)
            } else {
                const keyedEvidence = _.groupBy(result.rows, 'entry_uuid')
                res.send(keyedEvidence)
            }
            
        }
    )
})


module.exports = {profileRouter}
