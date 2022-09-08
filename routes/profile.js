const express = require('express')
const { pool } = require('../db/db')
const _ = require('lodash')
const { v4 } = require('uuid')
const { rest } = require('lodash')

const profileRouter = express.Router()

// #region ============================= SKILLS ENDPOINTS =============================

// Get the skills for a given employee ID
profileRouter.get('/:employeeID/skills', (req, res) => {
    const { employeeID } = req.params
    if (!employeeID) res.status(400).send('No employee ID specified')
    pool.query(
        `SELECT entry_uuid, employee_id, skill_name, skill_level, is_certification, skill_levels, employees_skills.created_at, employees_skills.updated_at, category FROM employees_skills
            LEFT JOIN skills
                ON skills.id = employees_skills.skill_id
            WHERE employee_id=$1`,
        [employeeID],
        (err, result) => {
            console.log(err)
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(result.rows)
            }
        }
    )
})

// ADD SKILL TO EMPLOYEE PROFILE
profileRouter.post('/:employeeID/add-skill', (req, res) => {
    const { skillID, skillLevel } = req.body
    const { employeeID } = req.params
    const allowedSkillLevels = [1, 2, 3, null, ' ', '']
    // Return 400 if invalid skills level is sent
    if (!allowedSkillLevels.includes(skillLevel)) {
        return res
            .status(400)
            .send('Invalid skill level. Skill level must be between 1 and 3, or an empty string if specified in body')
    }
    // Send 400 if invalid skill ID sent in req body
    if (!skillID || skillID === '') {
        return res.status(400).send('Invaid skill ID')
    }
    // Generate a UUID for the database entry
    const entryID = v4()
    const createdAt = new Date().toISOString()
    // Use this for both created and updated - this endpoint only creates new records
    pool.query(
        `INSERT INTO employees_skills (employee_id, skill_id, skill_level, entry_uuid, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
        [employeeID, skillID, skillLevel, entryID, createdAt, createdAt],
        (err, result) => {
            console.log(err)
            if (err) return res.status(500).send(err)
            const insertedRecord = { entryID, skillID, skillLevel, employeeID, createdAt, updatedAt: createdAt }
            return res.status(201).send(insertedRecord)
        }
    )
})

// DELETE SKILL FROM EMPLOYEE PROFILE
profileRouter.delete('/delete-entry/:entryUUID', (req, res) => {
    const { entryUUID } = req.params
    if (!entryUUID) return res.status(400).send('Request must specify skill entry UUID to be deleted')
    pool.query(`DELETE FROM employees_skills where entry_uuid=$1`, [entryUUID], (err, result) => {
        if (err) res.status(500).send(err)
        return res.status(204).send()
    })
})

// Updating date will go here
profileRouter.put('/update-entry/:entryID', (req, res) => {
    const { entryID } = req.params
    const { skillLevel } = req.body
    // Checks for invalid request data:
    if (!entryID) return res.status(400).send('No entry ID specified')
    console.log(typeof skillLevel)
    if (Number(skillLevel) > 3 || Number(skillLevel) < 1) {
        return res
            .status(400)
            .send(`Invalid skillLevel (value provided was: ${skillLevel}) - value must be between 1 and 3.`)
    }
    const updatedAt = new Date().toISOString()
    pool.query(
        `UPDATE employees_skills SET skill_level=$1, updated_at=$2 WHERE entry_uuid=$3`,
        [skillLevel, updatedAt, entryID],
        (err, result) => {
            console.log(err)
            if (err) {
                return res.status(500).send(err)
            } else {
                return res.status(200).send()
            }
        }
    )
})

// #endregion ============================= SKILLS ENDPOINTS =============================

// #region ============================= EVIDENCE ENDPOINTS =============================

// GET ALL EVIDENCE FOR AN EMPLOYEE
profileRouter.get('/:employeeID/evidence', (req, res) => {
    const { employeeID } = req.params
    if (!employeeID) res.status(400).send('No employee ID provided')

    pool.query(
        `SELECT entry_uuid, skill_name, evidence_url, evidence.created_at, evidence.updated_at, skills.description FROM employees_skills
                LEFT JOIN skills
                    ON skills.id = employees_skills.skill_id
                LEFT JOIN evidence
                    ON evidence.emp_skill_id = employees_skills.entry_uuid
                WHERE employee_id=$1`,
        [employeeID],
        (err, result) => {
            if (err) {
                console.log(err)
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

// GET EVIDENCE FOR A SKILL ENTRY
profileRouter.get('/skillEntry/:skillEntryID/evidence', (req, res) => {
    const { skillEntryID } = req.params
    pool.query(`SELECT * FROM evidence WHERE emp_skill_id = $1`, [skillEntryID], (err, result) => {
        if (err) {
            return res.status(500).send(err.message)
        } else {
            res.status(200).send(result.rows)
        }
    })
})
// ADD NEW EVIDENCE
profileRouter.post(`/evidence/new`, (req, res) => {
    const { skillEntry, evidenceURL, description } = req.body
    if (!skillEntry) return res.status(400).send('Skill entry ID (a uuid) is required to add a piece of evidence')
    const evidenceUUID = v4()
    const createdAt = new Date().toISOString()
    const updatedAt = new Date().toISOString()
    pool.query(
        `INSERT INTO evidence  (id, evidence_url, description, emp_skill_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [evidenceUUID, evidenceURL, description, skillEntry, createdAt, updatedAt],
        (err, result) => {
            console.log(err)
            if (err) return res.status(500).send(err)
            const createdEntry = { evidenceUUID, skillEntry, evidenceURL, description, createdAt, updatedAt }
            return res.status(201).send(createdEntry)
        }
    )
})
// UPDATE EVIDENCE
profileRouter.put(`/evidence/update/:evidenceUUID`, (req, res) => {
    const { evidenceUUID } = req.params
    const { evidenceURL, description } = req.body
    if (!evidenceUUID)
        return res
            .status(400)
            .send('No evidence UUID was provided in the request. Please provide this in the url request params')
    if (!evidenceURL || !description)
        return res.status(400).send('evidenceURL or description missing from request body')
    const updatedAt = new Date().toISOString()
    pool.query(
        `UPDATE evidence 
        SET evidence_url=$1,
            description=$2,
            updated_at=$4
        WHERE id=$3`,
        [evidenceURL, description, evidenceUUID, updatedAt],
        (err, result) => {
            if (err) {
                res.status(500).send(err.message)
            } else {
                console.log(result.rows)
                res.status(204).send(result.rows)
            }
        }
    )
})

// DELETE EVIDENCE
profileRouter.delete(`/evidence/delete/:evidenceUUID`, (req, res) => {
    const { evidenceUUID } = req.params
    if (!evidenceUUID) {
        return res.status(400).send('No evidence UUID provided in the request')
    }
    pool.query(`DELETE FROM evidence WHERE id=$1`, [evidenceUUID], (err, result) => {
        if (err) {
            return res.status(500).send(err.message)
        } else {
            return res.status(204).send()
        }
    })
})

// #endregion ============================= EVIDENCE ENDPOINTS =============================

module.exports = { profileRouter }
