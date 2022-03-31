// Dependencies
const express = require('express')
const uuid = require('uuid')
const { pool } = require('../db/db')

const skillsRouter = express.Router()

// Get all skills
skillsRouter.get('/all', (req, res) => {
    pool.query(`SELECT * FROM skills`, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})

// Search uses query params in search e.g. endpoint.com/skills/search?skill_name=SEARCHTERM
skillsRouter.get('/search', (req, res) => {
    const searchQuery = `%${req.query.skill_name}%`
    pool.query(`SELECT * FROM skills WHERE LOWER(skill_name) LIKE LOWER($1)`, [searchQuery], (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).send(err)
        } else {
            const searchResults = result.rows
            res.send(searchResults)
        }
    })
})

// Add a new skill
/** newSkill = {skill_name: string, category: string, description: string} */
skillsRouter.post('/new', (req, res) => {
    const { skillName, category, description } = req.body
    if (!skillName || !category) {
        res.status(400).send('Incomplete skill object')
    } else {
        const id = uuid.v4()
        pool.query(
            `INSERT INTO skills (id, skill_name, category, description)
        VALUES ($1, $2, $3, $4 )`,
            [id, skillName, category, description],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.status(500).send(err)
                } else {
                    res.status(201).send(result.rows)
                }
            }
        )
    }
})

// UPDATE A SKILL
skillsRouter.put('/:skillID', (req, res) => {
    const { id } = req.params
    const { skillName, category, description } = req.body
    if (!skillName || !category || !description) res.status(400).send('Incomplete skill object')
    pool.query(
        `
	UPDATE skills
	SET	skill_name=$1,
		category=$2,
		description=$3
	WHERE id=$4`,
        [skillName, category, description, id],
        (err, result) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(`Executed command successfully: ${result.command}`)
            }
        }
    )
})

// DELETE A SKILL
skillsRouter.delete('/:skillID', (req, res) => {
    const { skillID } = req.params
    pool.query(`DELETE FROM skills WHERE id=$1`, [skillID], (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(204).send()
        }
    })
})


//Get employees by a skill ID
skillsRouter.get('/employees-with-skill/:skillID', (req, res) => {
    const {skillID} = req.params
    pool.query(`
    SELECT DISTINCT firstname, lastname, employees.id AS employee_id, skill_name, skills.id AS skill_id, skill_level FROM employees
    RIGHT JOIN employees_skills
        ON employees_skills.employee_id = employees.id
    LEFT JOIN skills
        ON skills.id = employees_skills.skill_id
        WHERE skill_id = $1
    `,
    [skillID],
    (err, result) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(result.rows)
        }
    })
})

// Get employess by skills search - use query params: skill_name="testing"
skillsRouter.get('/employees-with-skill-search', (req, res) => {
    const searchQuery = `%${req.query.skill_name}%`
    console.log("HELLO")
    pool.query(`
    SELECT DISTINCT firstname, lastname, employees.id AS employee_id, skill_name, skills.id AS skill_id, skill_level FROM employees
    RIGHT JOIN employees_skills
        ON employees_skills.employee_id = employees.id
    LEFT JOIN skills
        ON skills.id = employees_skills.skill_id
        WHERE LOWER(skill_name) LIKE LOWER($1)
    `,
    [searchQuery],
    (err, result) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(result.rows)
        }
    })
})


// Get employees by a skill at a particular level
skillsRouter.get('/employees-with-skill/:skillID/level/:skillLevel', (req, res) => {
    const {skillID, skillLevel} = req.params
    pool.query(`
    SELECT DISTINCT firstname, lastname, employees.id AS employee_id, skill_name, skills.id AS skill_id, skill_level FROM employees
    RIGHT JOIN employees_skills
        ON employees_skills.employee_id = employees.id
    LEFT JOIN skills
        ON skills.id = employees_skills.skill_id
        WHERE skill_id = $1 AND skill_level = $2
    `,
    [skillID, skillLevel],
    (err, result) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(result.rows)
        }
    })
})

// TODO: Get employees by combination of skills

module.exports = { skillsRouter }
