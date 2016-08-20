function Config(host, room) {
  const self = this;

  this.host = host || '';
  this.room = room || '';
  this.setRoom = room => self.room = room;
}
const config = new Config('//twilio.mattburman.com');

chrome.extension.sendMessage({}, response => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === 'complete') {
      let client;

      clearInterval(readyStateCheckInterval);

      $('head').append('<script type=\'text/javascript\' src=\'https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js\'>');
      $('head').append('<script type=\'text/javascript\' src=\'https://media.twiliocdn.com/sdk/js/sync/v0.2/twilio-sync.min.js\'>');
      $('head').append('<style>.wwwatch-buttons{background-color:white; width: 100%; height: 80px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,.1);}</style>');

      fetchAccessToken(authData => {
        client = new Twilio.Sync.Client(new Twilio.AccessManager(authData.token));

        console.log('You are: ' + client.accessManager.identity);

        client.document('vid').then(doc => {
          doc.mutate(data => {
            $('video')[0].currentTime = data.time; // TODO: plus time since updated
            return data;
          });

          doc.on('updated', data => {
            $('video')[0].currentTime = data.time;
          });
        });

        $('video')[0].onplay = () => {
          client.document('vid').then(doc => {
            doc.mutate(data => {
              data.time = $('video')[0].currentTime;
              return data;
            });
          });
        };
      });

      // Button Controlls
      $('.watch-main-col').prepend('<div class=\'wwwatch-buttons\'><h1>Test</h1></div>');
      $('.watch-sidebar').prepend('<div class=\'wwwatch-buttons\'><h1>Test</h1></div>');
    }
  }, 10);
});

function fetchAccessToken(cb) {
  $.getJSON(config.host + '/token', { device: 'browser' }, cb);
}

