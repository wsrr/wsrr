WSRR
=========

Sample code showing how to connect to a WSRR server from Node.js over HTTPS.

## Installation

	npm install wsrr

## Usage

	var wsrr = require('wsrr')(
	{
 		"host": "wsrrserver.host.com",
  		"port": 9443,
  		"username": "username",
  		"password": "password"
	});
	wsrr.test(function(){console.log("success")}, function(){console.error("error")});

## License

Licensed under the Apache License, Version 2.0 (the "License"). See license.txt.
