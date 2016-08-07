const config = {
  host: 'twilio.public.mattburman.com'
};


chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);

    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    console.log("Hello. This message was sent from scripts/inject.js");
    // ----------------------------------------------------------

    //'user'=token
    var client = Twilio.Sync.Client(new Twilio.AccessManager('user'));

    fetchAccessToken(data => {
      console.log(data);
    });
  }
  }, 10);
});

function fetchAccessToken (cb) {
    $.getJSON(host + '/token', { device: 'browser' }, data => {
      console.log(data.token);
      console.log(data.identity);

      cb(data);
    });
}
