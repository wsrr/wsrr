/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var https = require("https");
var fs = require("fs");
var url = require("url");
var bunyan = require("bunyan");

// the module
var wsrrPrototype = {

	config : null,
	wsrrTestPath : "/WSRR/",

	// logger
	log : null,


	_configure : function _configure(configuration) {
		// make log so we can override with the contents of configuration
		var logConfig = null;
		// if configuration.log exists it should be a bunyan log config object
		if(configuration.log) {
			logConfig = configuration.log;
			// but we will override the name
			logConfig.name = "wsrr";
		} else {
			// use defaults
			logConfig = {name: "wsrr", level: "error"};
		}
		this.log = bunyan.createLogger(logConfig); // level can be error, debug, trace, etc
		this.log.debug("configuration entry");
		this.log.info({configuration: configuration}, "configuration");
		this.config = configuration;
		this.log.debug("configuration exit");
	},

	test : function test(successFn, errorFn) {
		this.log.debug({}, "test entry");

		var RESTURL = this.wsrrTestPath;
		
		// bind this callback to this, so this.x works as expected
		this._performRequest(RESTURL, 'GET', '', function(data) {
			this.log.debug({data: data}, "test performRequest callback entry");
			if (data == null || data == "") {
				errorFn();
			} else {
				successFn();
			}
			this.log.debug("test performRequest callback exit");
		}.bind(this), function(error){
			errorFn();
		}.bind(this));
		this.log.debug("test exit");
	},

	_performRequest : function _performRequest(endpoint, method, data, success, error) {
      this.log.debug({endpoint: endpoint, method: method, data: data}, "performRequest entry");
	  var dataString = data;
	  var headers = {};

	  if (dataString.length!=0) {
		headers = {
		  'Content-Type': 'application/json',
		  'Content-Length': dataString.length
		};
	  }

	  var options = {
		host: this.config.host,
		port: this.config.port,
		path: endpoint,
		method: method,
		headers: headers,
		auth: this.config.username+':'+this.config.password,
		rejectUnauthorized: false
	  };  

	  var that = this;
	  var req = https.request(options, function(res) {
		that.log.debug({res: res}, "performRequest response callback entry");

		res.setEncoding('utf-8');

		var responseString = '';

		res.on('data', function(data) {
		  responseString += data;
		});

		res.on('end', function() {
		  that.log.debug({responseString: responseString}, "performRequest response callback calling success");
		  success(responseString);
		  that.log.debug("performRequest response callback called success returned");
		});
		that.log.debug("performRequest response callback exit");
	  });

	  req.write(dataString);
	  req.end();

	  req.on('error', function(e) {
		that.log.error({error: e}, "performRequest error");
		 console.error(e);
		 error(e);
	  });
	  this.log.debug("performRequest exit");
	}
};

// factory
var wsrrFactory = function wsrrFactory(configuration) {
	var wsrr = Object.create(wsrrPrototype);
	// configure
	wsrr._configure(configuration);
	return wsrr;
};

/**
* Construct with config object with these keys:
var wsrr = require('wsrr')(
 {
  "host": "xxxx",
  "port": 9443,
  "username": "user",
  "password": "pass"
});

Then:

wsrr.test(successFn, errorFn);

*/
module.exports = function(configuration) {
	// check
	if(!configuration.host || !configuration.port || !configuration.username || !configuration.password) {
		throw "required config is missing: need host, port, username, password";
	}
	
	var wsrr = wsrrFactory(configuration);
	return wsrr;
};
