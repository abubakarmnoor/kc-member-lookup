/*eslint-disable no-shadow-global */
'use strict';
 
const Hapi = require('hapi');
const Request = require('request');
const Vision = require('vision');
const Handlebars = require('handlebars');
const LodashFilter = require('lodash.filter');
const LodashTake = require('lodash.take');

//const express = require('express');
//const server = express();
const port = process.env.PORT || 8080;
 
const server = new Hapi.Server();
 
server.connection({
	host: '0.0.0.0',//127.0.0.1
    port: port 
});

// Register vision for our views
server.register(Vision, (err) => {
    server.views({
        engines: {
            html: Handlebars
        },
        relativeTo: __dirname,
        path: './views',
    });
});
//
////post test
//server.route([{
//  method: 'GET',
//  path: '/',
//  config: {
//      payload: {
//          output: 'data'
//      }
//  },
//  handler: function (request, reply){
//    var search = request.payload.search;
//    var url = 'https://karmawarehouse.izenoondemand.com/production/api/trial/sugarLookupMembers.php?search='+search;
//    Request.get(url, function (error, response, body) {
//        if (error) {
//            throw error;
//        }
//        var data = body.replace('</pre>','').replace('<pre>','');
//        var data = JSON.parse(data);
//
//        reply.view('index', { result: data });
//    });
//
//  }
//}]);

// Show teams standings
server.route({
  method: 'POST',
  path: '/',
  config: {
      payload: {
          output: 'data'
      }
  },
  handler: function (request, reply){
    var search = request.payload.search;
    var url = 'https://karmawarehouse.izenoondemand.com/production/api/trial/sugarLookupMembers.php?search='+search;
    Request.get(url, function (error, response, body) {
        if (error) {
            throw error;
        }
        var data = body.replace('</pre>','').replace('<pre>','');
        var data = JSON.parse(data);

        reply.view('index', { result: data });
    });

  }
});
 
// A simple helper function that extracts team ID from team URL
Handlebars.registerHelper('teamID', function (teamUrl) {
    return teamUrl.slice(38);
});
 

// Show a particular team
server.route({
    method: 'GET',
    path: '/teams/{id}',
    handler: function (request, reply) {
        const teamID = encodeURIComponent(request.params.id);
 
        Request.get(`http://api.football-data.org/v1/teams/${teamID}`, function (error, response, body) {
            if (error) {
                throw error;
            }
 
            const result = JSON.parse(body);
 
            Request.get(`http://api.football-data.org/v1/teams/${teamID}/fixtures`, function (error, response, body) {
                if (error) {
                    throw error;
                }
 
                const fixtures = LodashTake(LodashFilter(JSON.parse(body).fixtures, function (match) {
                    return match.status === 'SCHEDULED';
                }), 5);
 
                reply.view('team', { result: result, fixtures: fixtures });
            });
        });
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
 
    console.log(`Server running at: ${server.info.uri}`);
});
 