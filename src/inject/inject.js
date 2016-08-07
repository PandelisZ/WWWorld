const config = {
  host: 'https://twilio.mattburman.com'
};


chrome.extension.sendMessage({}, function(response) {

	/*var readyStateCheckInterval = setInterval(function() {
  	if (document.readyState === "complete") {
  		clearInterval(readyStateCheckInterval);

  		// ----------------------------------------------------------
  		// This part of the script triggers when page is done loading
  		console.log("Hello. This message was sent from scripts/inject.js");
  		// ----------------------------------------------------------



  		// Editing the dom and manipulating the youtube
  		var ytID = window.location.search;
  		ytID = ytID.substring(2);

  		var ytEmbed = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+ ytId +'" frameborder="0" allowfullscreen></iframe>';

  		var mmvStart = function(){

  			$( "#body-container" ).append(ytEmbed);


  		};

  	}
	}, 10);*/

  var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);

    $('head').append("<script type='text/javascript' src='https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js'>");
    $('head').append("<script type='text/javascript' src='https://media.twiliocdn.com/sdk/js/sync/v0.2/twilio-sync.min.js'>");

    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    console.log("Hello. This message was sent from scripts/inject.js");
    // ----------------------------------------------------------

    //'user'=token
    var client;

    fetchAccessToken(function(data) {
      console.log(data);
      client = new Twilio.Sync.Client(new Twilio.AccessManager(data.token));

      console.log($('video')[0]);
      console.log(client);

      client.document("vid").then(function (doc) {
        doc.on("updated",function(data) {
          $('video')[0].currentTime = data.time;
        });
      });

      var ytCheck = setInterval(function() {
        //console.log($('video')[0].currentTime);

        client.document('vid').then(function(doc) {
          doc.mutate(function(data) {
            data.time = $('video')[0].currentTime;
            return data;
          });
        });
      }, 1000);

    });
  }
  }, 10);
});

function fetchAccessToken (cb) {
    $.getJSON(config.host + '/token', { device: 'browser' }, data => {
      console.log(data.token);
      console.log(data.identity);

      cb(data);
    });
}
