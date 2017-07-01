let ioSocket = io.connect("http://localhost:3000");

let is_reply;

ioSocket.on("connect", function() {
  is_reply = false;
  ioSocket.emit('connect_start');
});

ioSocket.on("disconnect", function() {});

ioSocket.on('before_timeline', function (status_list) {
  for(let tweet_status of status_list){
    prependMessage(tweet_status, $('#messageView'));
  }
});

ioSocket.on("before_mentions", function (mentions) {
  for(let mention of mentions){
    prependMessage(mention, $('#mentionView'));
  }
});

ioSocket.on("mention_come", function (data) {
  prependMessage(data.tweet_status, $('#mentionView'));
});

ioSocket.on("twitter_message", function(data) {
  prependMessage(data.tweet_status, $('#messageView'));
});

function retweet(tweet_id){
  if(window.confirm('Do you RT this tweet?')){
    ioSocket.emit('retweet_request', tweet_id);
  }
  else{
    window.alert('canceled');
  }
}

function favorite(tweet_id){
  ioSocket.emit('favorite_request', tweet_id);
}


function imageView(tweet_status){
  let img_tag = '';
  if('extended_entities' in tweet_status && 'media' in tweet_status.extended_entities){
    for(let media in tweet_status.extended_entities.media) {
      if(media.type === "photo"){
        img_tag += '<a href="'+ media.media_url +
            '"><img src="' + media.media_url + '" class="user-photo"></a>'
      }
      else if(media_list.media[j].type === "video"){
        return '';
      }
    }
    img_tag += '<br>'
  }
  return img_tag;
}

function prependMessage(tweet_status, $tab_id) {
  let id_str;
  let user_name;
  let user_id;
  let text;
  let user_icon ;
  let retweet_sentence;

  if('retweeted_status' in tweet_status){
    id_str = tweet_status.retweeted_status.id_str;
    user_name = tweet_status.retweeted_status.user.name;
    user_id = tweet_status.retweeted_status.user.screen_name;
    text = tweet_status.retweeted_status.text;
    user_icon = tweet_status.retweeted_status.user.profile_image_url;
    retweet_sentence = tweet_status.user.name + ' retweeted';
  }
  else{
    id_str = tweet_status.id_str;
    user_name = tweet_status.user.name;
    user_id = tweet_status.user.screen_name;
    text = tweet_status.text;
    user_icon = tweet_status.user.profile_image_url;
    retweet_sentence = '';
  }

  $tab_id.prepend(
    '<li class="tweet-li list-group-item list-group-item-action" id="'+id_str+'">' +
      '<p>' + retweet_sentence + '</p>'+
      '<div class="user-tweet">' +
        '<section class="column-icon"><img src="' + user_icon + '" ></section>' +
        '<section>' +
          '<strong><span  style="color: white">' + user_name + '</span></strong>' + '@'+ user_id +'<br>' +
          '<p><span style="color: white">' + text + '</span></p>' + imageView(tweet_status) +
        '</section>' +
      '</div>' +
      '<div class="mention-buttons">' +
        '<button class="btn btn-xs btn-primary" onclick="favorite(\'' +
          id_str + '\')"><span class="glyphicon glyphicon-star" aria-hidden="true"></span> Fav</button>' +
        '<button class="btn btn-xs btn-primary" onclick="retweet(\'' +
          id_str + '\')"><span class="gyphicon glyphicon glyphicon glyphicon-retweet" aria-hidden="true"></span> RT</button>' +
        '<button class="btn btn-xs btn-primary" onclick="reply(\'' +
          tweet_status + '\')"><span class="gyphicon glyphicon glyphicon-share-alt" aria-hidden="true"></span> reply</button>' +
      '</div>' +
    '</li>'
  );
}

