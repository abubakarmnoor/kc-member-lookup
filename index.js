'use strict'

const Hapi = require('hapi');
const Request = require('request');
const Vision = require('vision');
const Handlebars = require('handlebars');
const LodashFilter = require('lodash.filter');
const LodashTake = require('lodash.take');

const server = new Hapi.Server();
const port = process.env.PORT || 8080;

server.connection({
    host:'0.0.0.0',
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

//post test
server.route([{
  method: 'POST',
  path: '/',
  config: {
      payload: {
          output: 'data'
      }
  },
  handler: function (request, reply){
    var search = request.payload.search;
    var url = 'https://karmawarehouse.izenoondemand.com/production/api/trial/kcmemberdetails.php?search='+search;
    //var url = 'http://localhost:3000/accounts/'+search;
    Request.get(url, function (error, response, body) {
        if (error) {
            console.log(error);
            throw error;
        }
        //var data = body.replace('</pre>','').replace('<pre>','');
        var data1 = JSON.parse(body);
        // console.log(data1);
        reply.view('index', { result: data1 });
    });

  }
}]);


 // Show teams standings
 server.route({
     method: 'GET',
     path: '/',
     handler: function (request, reply) {
         Request.get('https://pastebin.com/raw/u6jnXSDD', function (error, response, body) {
             if (error) {
                 throw error;
             }
             //const data = JSON.parse(body);
             //console.log('language table');
             //console.log(data);
             // var data = body.replace('</pre>','').replace('<pre>','');
             // var data = JSON.stringify(data);
             // const data1 = JSON.parse(data);
             //reply.view('index', { result: data });
           reply.view('index');
         });
     }
 });

// A simple helper function that extracts team ID from team URL
Handlebars.registerHelper('teamID', function (teamUrl) {
    return teamUrl.slice(38);
});


// Show a particular team
//server.route({
//    method: 'GET',
//    path: '/teams/{id}',
//    handler: function (request, reply) {
//        const teamID = encodeURIComponent(request.params.id);
//
//        Request.get(`http://api.football-data.org/v1/teams/${teamID}`, function (error, response, body) {
//            if (error) {
//                throw error;
//            }
//
//            const result = JSON.parse(body);
//            console.log('particular team');
//
//            Request.get(`http://api.football-data.org/v1/teams/${teamID}/fixtures`, function (error, response, body) {
//                if (error) {
//                    throw error;
//                }
//
//                const fixtures = LodashTake(LodashFilter(JSON.parse(body).fixtures, function (match) {
//                    return match.status === 'SCHEDULED';
//                }), 5);
//
//                reply.view('team', { result: result, fixtures: fixtures });
//            });
//        });
//    }
//});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
});
