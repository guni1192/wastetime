 'use strict';

let electron = require('electron');
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;
let mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin')
    app.quit();
});

app.on('ready', function() {

  mainWindow = new BrowserWindow({width: 400, height: 700});
  mainWindow.loadURL('http://' + 'localhost' + ':3000');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

let twitter = require('twitter');
let http = require('http');
let socket = require('socket.io');
let path = require('path');
let fs = require('fs');
let mimeTypes = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css'
};
let querystring = require('querystring');


// OAuth認証
let keys = JSON.parse(fs.readFileSync('./oauthkeys.json', 'utf8'));
let client = new twitter({
    consumer_key        : keys.consumer_key,
    consumer_secret     : keys.consumer_secret,
    access_token_key    : keys.access_token_key,
    access_token_secret : keys.access_token_secret,
});

let http_server = new http.createServer(function(req, res) {
  let lookup = path.basename(decodeURI(req.url)) || 'index.html',
  f = './' + lookup;
  fs.exists(f, function (exists) {
    if (exists) {
      fs.readFile(f, function(err, data) {
        if (err) {
          res.writeHead(500);
          res.end('Server Error!');
          return;
        }
        let headers = {'Cpntent-Type' : mimeTypes[path.extname(f)]};
        res.writeHead(200, headers);
        res.end(data);
      });
      return;
    }
    res.writeHead(404);
    res.end('Nod found.');
  });
}).listen(3000);

let sio = socket.listen(http_server);

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
    // console.log(tweet.user.name);
    // console.log(tweet.text + '\n\n');
    console.log(tweet);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});

