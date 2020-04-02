const jwt = require('jsonwebtoken')
const User = require('../models/User.js')

// Note this is the supper secret for signing the JWT
// this should be acquired via .env or a microservice
const JWT_SECRET  = 'thisismysecretkey'

// function for creating tokens
function signToken(user) {
	// toObject() returns a basic js object 
	// comprised of data from db. Delete password before creating jwt
	const userData = user.toObject()
	delete userData.password
	return jwt.sign(userData, JWT_SECRET)
}

// function for verifying tokens
function verifyToken(req, res, next) {
	// grab token from either headers, req.body, or query string
	const token = req.get('token') || req.body.token || req.query.token
	// if no token present, deny access
	if(!token) return res.json({success: false, message: "No token provided"})
	// otherwise, try to verify token
	jwt.verify(token, JWT_SECRET, (err, decodedData) => {
		// if problem with token verification, deny access
		if(err) return res.json({success: false, message: "Invalid token."})
		// otherwise, search for user by id that was embedded in token
		User.findById(decodedData._id, (err, user) => {
			// if no user, deny access
			if(!user) return res.json({success: false, message: "Invalid token."})
			// otherwise, add user to req object
			req.user = user
			// go on to process the route:
			next()
		})
	})
}

module.exports = {
	signToken,
	verifyToken
}