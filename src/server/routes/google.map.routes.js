const routes = require('express').Router();
const apiKeys = require('../config/config.js');
const rp = require('request-promise');

routes.post('/api/addressMap', (req, res) => {
  let code = req.body.latlngCode.lat+','+req.body.latlngCode.lng;
  console.log('code: ', code)
	const options = {
	    uri: "https://maps.googleapis.com/maps/api/geocode/json?",
	    qs: {
        latlng: code,
        key : apiKeys.googleMap,
	    },
	    headers: {
	    },
	};

  rp(options)
  .then(function(response) {
    res.status(200).send(response);
  })
  .catch(function(err) {
    console.log(err);
    res.status(400).send('Something\s wrong, please try again!')
  })
});

routes.post('/api/latlngMap', function(req, res) {

  console.log('I get the address from client!!!', req.body.address);
  let address = req.body.address;

  const options = {
    uri: "https://maps.googleapis.com/maps/api/geocode/json?",
    qs: {
      address: address,
      key : apiKeys.googleMap,
    },
    headers: {
    }
  };
  rp(options)
  .then(function(response) {
    res.status(200).send(response);
  })
  .catch(function(err) {
    console.log(err);
    res.status(400).send('Something\s wrong, please try again!')
  })
});

module.exports = routes;






