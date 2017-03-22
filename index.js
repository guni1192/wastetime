var twitter = require('twitter');
var http = require('http');
var socket = require('socket.io');
var fs = require('fs');
var keys = JSON.parse(fs.readFileSync('./oauthkeys.json', 'utf8'));

var client = new twitter({
    consumer_key        : keys.consumer_key,
    consumer_secret     : keys.consumer_secret,
    access_token_key    : keys.access_token_key,
    access_token_secret : keys.access_token_secret,
});

var http_server = new http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(fs.readFileSync('./index.html', 'utf-8'));
}).listen(3000);

var sio = socket.listen(http_server);

sio.sockets.on('connection', function(socket){});

client.stream('user',
  function(stream) {

    stream.on('data', function(tweet) {
      sio.sockets.emit('twitter_message',
        { 'name': tweet.user.name,
          'text': tweet.text,
          'icon': tweet.user.profile_image_url
        });
      console.log(tweet.user.name);
      console.log(tweet.text);
      console.log(tweet.user.profile_image_url)
    });

    stream.on('error', function(error) {
      console.log(error);
    });
  }
);

