const routes = require('express').Router();

const yelpRoutes = require('./yelp.routes.js')
const googleAuthRoutes = require('./google.auth.routes.js')
const authRoutes = require('./auth.routes.js')
const eventbriteRoutes = require('./eventbrite.routes.js')

// middleware to protect routes
function ensureAuthenticated(req, res, next) {
	console.log(req.isAuthenticated());
	if (req.isAuthenticated()) {
		return next();
	} else {
		return res.redirect('/login')
	}
}

routes.use(yelpRoutes);

// auth routes
routes.use(googleAuthRoutes);
routes.use(authRoutes);

// test route
routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' });
});


// TO PROTECT ROUTES, attach ensureAuthenticated function
// routes.get('/api/yelp', ensureAuthenticated);
routes.use(yelpRoutes);
routes.use(eventbriteRoutes);


module.exports = routes;