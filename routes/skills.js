// Dependencies
const express = require('express')
const uuid = require('uuid')
const { pool } = require('../db/db')

const skillsRouter = express.Router()

//Get all distinct skill category
skillsRouter.get('/distinctSkillCategory', (req, res) => {
    pool.query(`SELECT DISTINCT category FROM skills`, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})

// Get All skill levels
skillsRouter.get('/skill_Levels', (req, res) => {
    pool.query(`SELECT DISTINCT competency_type FROM skill_levels`, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})


// Get all skillss
skillsRouter.get('/all', (req, res) => {
    pool.query(`SELECT skills.id, skill_name, description, category, is_certification, competency_type, lvl_1, lvl_2, lvl_3 FROM skills 
    LEFT JOIN skill_levels
    ON skills.skill_levels = skill_levels.id`, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})

// Get all entry employee skills For excel ssss
skillsRouter.get('/extract/all', (req, res) => {
    pool.query(`SELECT * FROM employees JOIN employees_skills ON employees.id = employees_skills.employee_id JOIN skills ON employees_skills.skill_id = skills.id`, (err, result) => {
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
    const { skillName, category, description, isCertification, skill_levels } = req.body
    if (!skillName || !category || isCertification === null) {
        res.status(400).send(`Incomplete skill object. New skill must include following fields in request body:
        skillName, category, description, isCertification`)
    } else {
        const id = uuid.v4()
        pool.query(
            `INSERT INTO skills (id, skill_name, category, description, is_certification, skill_levels)
        VALUES ($1, $2, $3, $4, $5, $6 )`,
            [id, skillName, category, description, isCertification, skill_levels],
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
    const { skillID } = req.params
    const { skillName, category, description, isCertification } = req.body
    if (!skillName || !category || isCertification === null)
        res.status(400).send(
            `Incomplete skill object. Skill data must include following fields in request body:
        skillName, category, description, isCertification`
        )
    pool.query(
        `
	UPDATE skills
	SET	skill_name=$1,
		category=$2,
		description=$3,
        is_certification=$4
	WHERE id=$5`,
        [skillName, category, description, isCertification, skillID],
        (err, result) => {
            if (err) {
                console.log(err)
                res.status(500).send(err)
            } else {
                console.log(isCertification)
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
    const { skillID } = req.params
    pool.query(
        `
    SELECT DISTINCT employees.id AS id, firstname, lastname, country, email, manager_id, skill_name, skills.id AS skill_id, skill_level FROM employees
    RIGHT JOIN employees_skills
        ON employees_skills.employee_id = employees.id
    LEFT JOIN skills
        ON skills.id = employees_skills.skill_id
        WHERE skill_id = $1
    `,
        [skillID],
        (err, result) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send(result.rows)
            }
        }
    )
})

// Get employess by skills search - use query params: skill_name="testing"
skillsRouter.get('/employees-with-skill-search', (req, res) => {
    const searchQuery = `%${req.query.skill_name}%`
    pool.query(
        `
    SELECT DISTINCT employees.id AS id, firstname, lastname, country, email, manager_id, skill_name, skills.id AS skill_id, skill_level FROM employees
    RIGHT JOIN employees_skills
        ON employees_skills.employee_id = employees.id
    LEFT JOIN skills
        ON skills.id = employees_skills.skill_id
        WHERE LOWER(skill_name) LIKE LOWER($1)
    `,
        [searchQuery],
        (err, result) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send(result.rows)
            }
        }
    )
})

// Get employees by a skill at a particular level
skillsRouter.get('/employees-with-skill/:skillID/level/:skillLevel', (req, res) => {
    const { skillID, skillLevel } = req.params
    pool.query(
        `
    SELECT DISTINCT employees.id AS id, firstname, lastname, country, email, manager_id, skill_name, skills.id AS skill_id, skill_level FROM employees
    RIGHT JOIN employees_skills
        ON employees_skills.employee_id = employees.id
    LEFT JOIN skills
        ON skills.id = employees_skills.skill_id
        WHERE skill_id = $1 AND skill_level = $2
    `,
        [skillID, skillLevel],
        (err, result) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.status(200).send(result.rows)
            }
        }
    )
})

// TODO: Get employees by combination of skills
/*
Req body must include 
    { 
        skills: ['Skill1', 'Skill2', 'Skill3']
    } 
*/

skillsRouter.get('/employees-with-skillset', (req, res) => {
    const skillsArr = req.query.skills.split(',')
    if (skillsArr.length === 0 || !skillsArr) {
        res.status(403).send('No skills specified')
    }

    const skillsQueryString = `${skillsArr.join(', ')}`
    console.log(skillsArr)
    pool.query(
        `
      SELECT employees_with_skills.id, employees_with_skills.firstname, employees_with_skills.lastname, employees_with_skills.country, employees_with_skills.email, employees_with_skills.manager_id
FROM (
SELECT employees.id AS id, firstname, lastname, country, email, manager_id, skill_name, skills.id AS skill_id, skill_level FROM employees
    RIGHT JOIN employees_skills
        ON employees_skills.employee_id = employees.id
    LEFT JOIN skills
        ON skills.id = employees_skills.skill_id
		WHERE skill_id = ANY ($1)
	) AS employees_with_skills
	GROUP BY(employees_with_skills.id, employees_with_skills.firstname, employees_with_skills.lastname, employees_with_skills.country, employees_with_skills.email, employees_with_skills.manager_id)
	HAVING COUNT(id) >= $2`,
        [skillsArr, skillsArr.length],
        (err, result) => {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(result.rows)
            }
        }
    )
})

module.exports = { skillsRouter }
