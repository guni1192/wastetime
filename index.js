var twitter = require('twitter');
var http = require('http');
var socket = require('socket.io');
var fs = require('fs');
var querystring = require('querystring');

// OAuth認証
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
  // tweet処理
  if(req.url === '/tweet' && req.method === 'POST'){
    var body = '';
    req.on('data', function(data){
      body += data;
    });
    req.on('end', function(chunck){
      var POST = querystring.parse(body);
      console.log(POST);
      console.log(POST['tweet'])
    });
  }
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
    });

    stream.on('error', function(error) {
      console.log(error);
    });
  }
);

