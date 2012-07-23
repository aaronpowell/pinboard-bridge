var //pinboard = require('pinboard'),
    parser = require('sax2json'),
	request = require('request'),
	express = require('express'),
	server = express.createServer();

server.all('*', function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-HTTP-Method-Override, Origin, Accept, Authorization');
   res.header('Access-Control-Allow-Credentials', 'true');
   res.header('Access-Control-Allow-Method', 'GET');
   next();
});

server.get('*', function (req, res) {
    var header = req.headers['authorization'] || '',        // get the header
	    token = header.split(/\s+/).pop() || '',            // and the encoded auth token
	    auth = new Buffer(token, 'base64').toString(),    // convert from base64
	    parts = auth.split(/:/),                          // split on colon
	    username = parts[0],
	    password = parts[1],
      newApi = req.query['auth_token'];

    if ((!username || !password) && !newApi) {
        res.json({ error: 'Not Authorized' });
        return;
    } else if (!newApi) {
        username = username + ':' + password + '@'
    }

    var url = 'https://' + username + 'api.pinboard.in/v1' + req.path + '?';

    var query = req.query;

    for (var key in query) {
        if (!Object.prototype.hasOwnProperty.call(query, key)) {
            continue;
        }
        url = url + key + '=' + encodeURIComponent(query[key]) + '&';
    }

    request({
        url: url
    }, function (error, response, body) {
        if (response.statusCode !== 200) {
          res.send(body, response.statusCode);
        } else {
          if (req.query['format'] === 'json') {
              res.json(JSON.parse(body));
          } else {
            parser.toJson(body, function (x, obj) {
              res.json(obj);
            });            
          }          
        }
    });
});

server.listen(process.env.PORT || 1337);