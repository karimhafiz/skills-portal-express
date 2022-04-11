const express = require('express')
const { pool } = require('../db/db')
const employeeRouter = express.Router()

// Get all employees
employeeRouter.get('/all', async (req, res) => {
    pool.query(`SELECT * FROM employees`, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})

// Get employees by ID
employeeRouter.get('/:id', (req, res) => {
    const { id } = req.params
    pool.query(`SELECT * FROM employees WHERE id=$1`, [id], (err, result) => {
        if (err) res.status(500).send(err)
        else {
            res.send(result.rows)
        }
    })
})

// Get employees by country code
employeeRouter.get('/country/:countryCode', (req, res) => {
    const { countryCode } = req.params
    pool.query(`SELECT * FROM employees WHERE LOWER(country)=$1`, [countryCode.toLowerCase()], (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})

// Get employees by email
employeeRouter.get('/email-address/:emailAddress', (req, res) => {
    const { emailAddress } = req.params
    const emailTerm = `%${emailAddress.toLowerCase()}%`
    pool.query(`SELECT * FROM employees WHERE LOWER(email) LIKE $1`, [emailTerm], (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})

// Get employees by email and regions
employeeRouter.get('/email-address/:emailAddress/country/:countryCode', (req, res) => {
    const { emailAddress, countryCode } = req.params;
    const emailTerm = `%${emailAddress.toLowerCase()}%`
    pool.query(`SELECT * FROM employees WHERE LOWER(email) LIKE $1 AND LOWER(country) = $2`,
        [emailTerm, countryCode.toLowerCase()], (err, result) => {
            if (err) {
            res.status(500).send(err)
            } else {
                res.send(result.rows)
        }
    })
})

// Get employees by manager ID
employeeRouter.get('/reports-to/:managerID', (req, res) => {
    const { managerID } = req.params
    pool.query(`SELECT * FROM employees WHERE manager_id=$1`, [managerID], (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(result.rows)
        }
    })
})

// Post a new employee - body must be in format below
employeeRouter.post('/new', (req, res) => {
    /**
     * {id: string, firstname: string, surname: string, sountry: string, email: string, manager_id: string} body
     */
    const body = req.body
    // handle bad request missing data
    if (!body.id || !body.firstname || !body.lastname || !body.country || !body.email || !body.manager_id) {
        console.log(body)
        res.status(400).send('Request must include id, firstname, lastname, country, email & manager_id')
    } else {
        pool.query(
            `INSERT INTO employees (id, firstname, lastname, country, email, manager_id)
        VALUES ($1, $2, $3, $4, $5, $6)`,
            [body.id, body.firstname, body.lastname, body.country, body.email, body.manager_id],
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

// Delete an employee by their ID
employeeRouter.delete('/delete/:id', (req, res) => {
    const { id } = req.params
    if (!id) {
        res.status(400).send('No ID specified for deletion')
    } else {
        pool.query(`DELETE FROM employees WHERE id=$1`, [id], (err, result) => {
            if (err) {
                res.status(500).send()
            } else {
                res.status(204).send()
            }
        })
    }
})

module.exports = { employeeRouter }
