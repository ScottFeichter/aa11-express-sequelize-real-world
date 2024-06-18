// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import model(s)
const { Student, sequelize } = require('../db/models');
const { Op } = require('sequelize');

// List
router.get('/', async (req, res, next) => {
	let errorResult = { errors: [], count: 0, pageCount: 0 };

	// Phase 1A:
	const { lastName, firstName, lefty } = req.query;

	// Phase 2A: Use query params for page & size
	// Your code here

	let { page, size } = req.query;
	if (page === undefined) {
		page = 1;
	}
	if (size === undefined) {
		size = 10;
	}
	// Phase 2B (optional): Special case to return all students (page=0, size=0)
	if (+page === 0 && +size === 0) {
		const students = await Student.findAll({
			order: [
				['lastName', 'ASC'],
				['firstName', 'ASC'],
			],
		});
		let result = {};
		result.rows = students;
		result.page = 1;
		return res.json(result);
	}

	// Phase 2B: Calculate limit and offset

	const limit = parseInt(size);
	const offset = parseInt(size) * (parseInt(page) - 1);

	// Phase 2B 'Requires valid page and size params' when page or size is invalid
	const err = {
		message: 'Requires valid page and size params',
	};

	// Phase 2B: Add an error message to errorResult.errors of

	if (page && size) {
		if (!Number.isInteger(+page) || !Number.isInteger(+size)) {
			const count = await Student.count();
			errorResult.errors.push(err);
			errorResult.count = count;
			errorResult.pageCount = Math.ceil(count / limit);
			console.log('line 58ish');
			return next(errorResult);
		}
	}

	// Phase 4: Student Search Filters
	/*
        firstName filter:
            If the firstName query parameter exists, set the firstName query
                filter to find a similar match to the firstName query parameter.
            For example, if firstName query parameter is 'C', then the
                query should match with students whose firstName is 'Cam' or
                'Royce'.


        lastName filter: (similar to firstName)
            If the lastName query parameter exists, set the lastName query
                filter to find a similar match to the lastName query parameter.
            For example, if lastName query parameter is 'Al', then the
                query should match with students whose lastName has 'Alfonsi' or
                'Palazzo'.

        lefty filter:
            If the lefty query parameter is a string of 'true' or 'false', set
                the leftHanded query filter to a boolean of true or false
            If the lefty query parameter is neither of those, add an error
                message of 'Lefty should be either true or false' to
                errorResult.errors
    */
	const where = {};

	if (firstName) {
		where.firstName = {
			[Op.like]: firstName,
		};
	}

	if (lastName) {
		where.lastName = {
			[Op.like]: lastName,
		};
	}

	if (lefty) {
		if (lefty === 'true') {
			console.log('lefty: ', lefty);
			where.leftHanded = true;
		} else if (lefty === 'false') {
			console.log('lefty: ', lefty);
			where.leftHanded = false;
		} else {
			const newError = { message: 'Lefty should be either true or false' };
			errorResult.errors.push(newError);
			console.log('line 107ish');
		}
	}

	// QUESITON: HOW CAN WE GET THE LEFTCOUNT IN THE RESULT

	// Your code here

	// Phase 2C: Handle invalid params with "Bad Request" response
	// Phase 3C: Include total student count in the response even if params were
	// invalid
	/*
            If there are elements in the errorResult.errors array, then
            return a "Bad Request" response with the errorResult as the body
            of the response.

            Ex:
                errorResult = {
                    errors: [{ message: 'Grade should be a number' }],
                    count: 267,
                    pageCount: 0
                }
        */
	// Your code here
	if (errorResult.errors.length) {
		res.status(400);
		return res.json(errorResult);
	}

	let result = {};
	const students = await Student.findAll({
		order: [
			['lastName', 'ASC'],
			['firstName', 'ASC'],
		],
		limit: limit,
		offset: offset,
		where: where,
	});

	result.page = page;
	result.rows = students;
	const findCount = await Student.findAll({
		where: where,
		attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'count']],
	});
	result.count = findCount;
	const studentCount = await Student.count();
	const pageCount = Math.ceil(studentCount / limit);
	result.totalPages = pageCount;

	// Phase 3A: Include total number of results returned from the query without
	// limits and offsets as a property of count on the result
	// Note: This should be a new query

	// result.rows = await Student.findAll({
	// 	attributes: ['id', 'firstName', 'lastName', 'leftHanded'],
	// 	where,
	// 	// Phase 1A: Order the Students search results
	// });

	// Phase 2E: Include the page number as a key of page in the response data
	// In the special case (page=0, size=0) that returns all students, set
	// page to 1
	/*
            Response should be formatted to look like this:
            {
                rows: [{ id... }] // query results,
                page: 1
            }
        */
	// Your code here

	// Phase 3B:
	// Include the total number of available pages for this query as a key
	// of pageCount in the response data
	// In the special case (page=0, size=0) that returns all students, set
	// pageCount to 1
	/*
            Response should be formatted to look like this:
            {
                count: 17 // total number of query results without pagination
                rows: [{ id... }] // query results,
                page: 2, // current page of this query
                pageCount: 10 // total number of available pages for this query
            }
        */
	// Your code here

	res.json(result);
});

// Export class - DO NOT MODIFY
module.exports = router;
