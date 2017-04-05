let ioSocket = io.connect("http://localhost:3000");

ioSocket.on("disconnect", function() {});

ioSocket.on("twitter_message", function(data) {
  prependMessage(data.tweet_status)
});

$('form#tweet-form').submit(function(){
  if(window.confirm('Can I tweet this?\n\''+ $('#mytweetText').val() +'\'')){
    ioSocket.emit('my_tweet', $('#mytweetText').val());
    $('#mytweetText').val('');
    return false;
  }
  else{
    window.alert('canceled');
  }
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

function reply(reply_id){
  $('#mytweetText').val('@' + reply_id);
}

function imageView(tweet_status){
  let img_tag = '';
  if('extended_entities' in tweet_status && 'media' in tweet_status.extended_entities){
    let media_list = tweet_status.extended_entities.media;
    for(let j = 1; j < media_list.length; j++) {
      if(media_list[j].type === "photo"){
        img_tag += '<a href="'+ media_list[j].media_url +
            '"><img src="' + media_list[j].media_url + '" class="user-photo"></a>'
      }
      else if(media_list.media[j].type === "video"){
        return '';
      }
      img_tag += '<br>'
    }
  }
  return img_tag;
}

function prependMessage(tweet_status) {
  let id_str = tweet_status.id_str;
  let user_name = tweet_status.user.name;
  let user_id = tweet_status.user.screen_name;
  let text = tweet_status.text;
  let user_icon = tweet_status.user.profile_image_url;

  $("#messageView").prepend(
    '<li class="tweet-li list-group-item list-group-item-action" id="'+id_str+'">' +
      '<div class="user-tweet">' +
        '<section class="column-icon"><img src="' + user_icon + '" ></section>' +
        '<section>' +
          '<strong><span  style="color: white">' + user_name + '</span></strong>' + '@'+ user_id +'<br>' +
          '<p><span style="color: white">' + text + '</span></p>' + imageView(tweet_status) +
        '</section>' +
      '</div>' +
      '<div class="mention-buttons">' +
        '<button class="btn btn-xs btn-primary" onclick="favorite(\'' + id_str + '\')"><span class="glyphicon glyphicon-star" aria-hidden="true"></span> Fav</button>' +
        '<button class="btn btn-xs btn-primary" onclick="retweet(\'' + id_str + '\')"><span class="gyphicon glyphicon glyphicon glyphicon-retweet" aria-hidden="true"></span> RT</button>' +
        '<button class="btn btn-xs btn-primary" onclick="reply(\'' + user_id + '\')"><span class="gyphicon glyphicon glyphicon-share-alt" aria-hidden="true"></span> reply</button>' +
      '</div>' +
    '</li>'
  );
}

