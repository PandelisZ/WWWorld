const config = {
  host: '//twilio.mattburman.com'
};

chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      $('head').append("<script type='text/javascript' src='https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js'>");
      $('head').append("<script type='text/javascript' src='https://media.twiliocdn.com/sdk/js/sync/v0.2/twilio-sync.min.js'>");
      var client;

      fetchAccessToken(function(data) {
        client = new Twilio.Sync.Client(new Twilio.AccessManager(data.token));

        console.log("You are: " + client.accessManager.identity);

        client.document("vid").then(function (doc) {
          doc.mutate(function(data) {
            $('video')[0].currentTime = data.time; //TODO: plus time since updated

            return data;
          });

          doc.on("updated",function(data) {
            $('video')[0].currentTime = data.time;
          });
        });

        $('video')[0].onplay = function() {
          client.document('vid').then(function(doc) {
            doc.mutate(function(data) {
              data.time = $('video')[0].currentTime;

              return data;
            });
          });
        };
      });
    }
  }, 10);
});

function fetchAccessToken (cb) {
  $.getJSON(config.host + '/token', { device: 'browser' }, data => {
    cb(data);
  });
}
