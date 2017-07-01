const twitter = require('twitter');
const socket = require('socket.io');
let path = require('path');
let fs = require('fs');

let express = require('express');
let app = express();

app.use(express.static('public'));

// OAuth認証
const keys = JSON.parse(fs.readFileSync('./oauthkeys.json', 'utf8'));
let client = new twitter({
  consumer_key        : keys.consumer_key,
  consumer_secret     : keys.consumer_secret,
  access_token_key    : keys.access_token_key,
  access_token_secret : keys.access_token_secret,
});

let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Waste Time listening at http://%s:%s', host, port);
});

app.set('view engine', 'ejs')
app.get('/', function(req, res) {
  res.render('index', {})
})

let sio = socket.listen(server);

sio.sockets.on('connection', function(socket){
  socket.on('connect_start', function(){
    // 起動する前のタイムラインの取得
    client.get('statuses/home_timeline', {count: 100},
      function (error, tweet_list, response){
        tweet_list.reverse();
        sio.emit('before_timeline', tweet_list);
    });
    // 起動する前のMentionを取得する
    client.get('/statuses/mentions_timeline.json', {}, 
      function (error, mentions, response) {
        mentions.reverse();
        sio.emit('before_mentions', mentions);
    });
  });

  socket.on('my_tweet', function(tweet_text, reply_id){
    client.post('statuses/update', 
      {
        status: tweet_text, 
        in_reply_to_status_id: reply_id
      },
      function(error, msg, response) {
        if (!error) {
          console.log(tweet_text);
       }
    });
  });
  // Retweetボタンを押したときの処理
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
  // Favoriteボタンを押したときの処理
  socket.on('favorite_request', function(tweet_id){
    console.log(tweet_id);
    client.post('favorites/create', {id: tweet_id}, 
      function(error, tweet, response){
        if(!error){
          console.log('Favorite success');
        }
        else{
          console.log(error);
        }
    });
  });
});

// Userstreamの処理
client.stream('user', function(stream) {

  stream.on('data', function(tweet) {
    // console.log(tweet);
    sio.sockets.emit('twitter_message', { 'tweet_status': tweet });
    if('in_reply_screen_name' in tweet && tweet.in_reply_screen_name === "guni1192"){
      sio.sockets.emit('mention_come', {'tweet_status': tweet});
    }
  });
  stream.on('error', function(error) {
    console.log(error);
  });
});

