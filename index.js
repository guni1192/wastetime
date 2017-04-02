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

}).listen(3000);


var sio = socket.listen(http_server);

sio.sockets.on('connection', function(socket){
  socket.on('my_tweet', function(tweet_text){
    client.post('statuses/update', {status: tweet_text}, function(error, msg, response) {
      if (!error) {
        console.log(tweet_text);
      }
    });
  });
  socket.on('retweet_request', function(tweet_id){
    console.log(tweet_id);
    client.post('statuses/retweet/'+tweet_id, {id: tweet_id}, function (error, tweet, response) {
      if (!error) {
        console.log('Retweeted');
      }
      else{
        console.log(error);
      }
    });
  });
  socket.on('favorite_request', function(tweet_id){
    console.log(tweet_id);
    client.post('favorites/create', {id: tweet_id}, function(error, tweet, response){
      if(!error){
        console.log('Favorite success');
      }
      else{
        console.log(error);
      }
    })
  });
});


client.stream('user', function(stream) {

  stream.on('data', function(tweet) {
    sio.sockets.emit('twitter_message', { 'tweet_status': tweet });
    console.log(tweet.user.name);
    console.log(tweet.id);
    console.log(tweet.id_str);
    console.log(tweet.text + '\n\n');
  });

  stream.on('error', function(error) {
    console.log(error);
  });

});



