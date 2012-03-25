var //pinboard = require('pinboard'),
    parser = require('sax2json'),
	request = require('request'),
	express = require('express'),
	server = express.createServer();

server.all('*', function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With Authentication");
   res.header("Access-Control-Allow-Credentials", "true");
   next();
});

server.get('*', function (req, res) {
    var header = req.headers['authorization'] || '',        // get the header
	    token = header.split(/\s+/).pop() || '',            // and the encoded auth token
	    auth = new Buffer(token, 'base64').toString(),    // convert from base64
	    parts = auth.split(/:/),                          // split on colon
	    username = parts[0],
	    password = parts[1];
        
    if (!username || !password) {
        res.json({ error: 'Not Authorized' });
        return;
    }

    var url = "https://" + username + ":" + password + "@api.pinboard.in/v1";

    request({
        url: url + req.path
    }, function (error, response, body) {
        parser.toJson(body, function (x, obj) {
			res.json(obj);
		});
    });
});

server.listen(process.env.PORT || 1337);