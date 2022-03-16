// Dependencies
const express = require("express");
const uuid = require("uuid");
const { pool } = require("../db/db");

const skillsRouter = express.Router();

// Get all skills
skillsRouter.get("/all", (req, res) => {
	pool.query(`SELECT * FROM skills`, (err, result) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.send(result.rows);
		}
	});
});

// Search uses query params in search e.g. endpoint.com/skills/search?skill_name=SEARCHTERM
skillsRouter.get("/search", (req, res) => {
	const searchQuery = `%${req.query.skill_name}%`;
	console.log(searchQuery);
	pool.query(
		`SELECT * FROM skills WHERE LOWER(skill_name) LIKE LOWER($1)`,
		[searchQuery],
		(err, result) => {
			if (err) {
				console.log(err);
				res.status(500).send(err);
			} else {
				const searchResults = result.rows;
				res.send(searchResults);
			}
		}
	);
});

// TODO: Check in postman
// Add a new skill
/** newSkill = {skill_name: string, experience_levels: string[]} */
skillsRouter.post("/new", (req, res) => {
	const newSkill = req.body;
	if (!newSkill.skill_name || !newSkill.experience_levels) {
		res.status(400).send("Incomplete skill object");
	} else {
		newSkill.id = uuid.v4();
		console.log(newSkill)
		pool.query(
			`INSERT INTO skills (id, skill_name, experience_levels)
        VALUES ($1, $2, $3 )`,
			[newSkill.id, newSkill.skill_name, newSkill.experience_levels],
			(err, result) => {
				if (err) {
					console.log(err)
					res.status(500).send(err);
				} else {
					res.status(201).send(result.rows);
				}
			}
		);
	}
});

module.exports = { skillsRouter };
