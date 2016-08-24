chrome.runtime.sendMessage({
  from: 'content',
  subject: 'joinRoom',
  room: 'room',
});

function Config(host) {
  const self = this;

  this.host = host || '';
  this.syncPaused = false;

  this.room = '';

  this.toggleSync = (cb) => {
    chrome.storage.sync.set({ paused: !self.syncPaused }, () => {
      self.syncPaused = !self.syncPaused;
      cb(self.syncPaused);
    });
  };
  this.joinRoom = (newRoom, joinedCb) => {
    const normalisedNewRoom = newRoom.trim().toLowerCase();
    console.log('attempting to join: ', normalisedNewRoom);

    // defend against subscribing to the same room twice
    if (normalisedNewRoom === self.room) return;
    self.room = normalisedNewRoom;
    console.log('joining ', self.room);

    self.room = normalisedNewRoom;
    chrome.storage.sync.set({ room: self.room }, () => {
      console.log(`room: ${self.room}`);

      self.room = normalisedNewRoom;
      self.client.document(self.room).then(doc => {
        console.log('joinedCb~', joinedCb);
        if (joinedCb) joinedCb(self.room);
        console.log('then doc cb');
        doc.mutate(data => {
          console.log('mutateCb');
          changeTime(data.time);
          return data;
        });

        doc.on('updated', data => {
          console.log('remote updated');
          changeTime(data.time);
        });
      });

      $('video')[0].onplay = () => {
        config.client.document(self.room).then(doc => {
          doc.mutate(data => {
            console.log('onplay mutate cb');
            data.time = $('video')[0].currentTime;
            return data;
          });
        }).catch(err => {
          console.log('onPlayERR: ', err);
        });
      };
    });
  };
}
const config = new Config('//twilio.mattburman.com');

const readyStateCheckInterval = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(readyStateCheckInterval);

    $('head').append('<script type=\'text/javascript\' src=\'https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js\'>');
    $('head').append('<script type=\'text/javascript\' src=\'https://media.twiliocdn.com/sdk/js/sync/v0.2/twilio-sync.min.js\'>');
    $('head').append('<style>.wwwatch-buttons{background-color:white; width: 100%; height: 80px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,.1);}</style>');

    fetchAccessToken(authData => {
      config.client = new Twilio.Sync.Client(new Twilio.AccessManager(authData.token));
      console.log('You are: ' + config.client.accessManager.identity);

      chrome.storage.onChanged.addListener((changes, namespace) => {
        const roomChanges = changes.room;
        console.log(roomChanges.oldValue + ' => ' + roomChanges.newValue);
        config.joinRoom(roomChanges.newValue);
      });

      chrome.storage.sync.get('room', data => {
        console.log(data);
        config.joinRoom(data.room);
      });
    });

    // Button Controlls
    $('.watch-main-col').prepend('<div class=\'wwwatch-buttons\'><h1>Test</h1></div>');
    $('.watch-sidebar').prepend('<div class=\'wwwatch-buttons\'><h1>Test</h1></div>');
  }
}, 10);

function fetchAccessToken(cb) {
  $.getJSON(config.host + '/token', { device: 'browser' }, cb);
}

function changeTime(time) {
  console.log(time);
  if (!config.syncPaused) $('video')[0].currentTime = time || 0;
}

console.log('test');
chrome.runtime.onMessage.addListener((msg, sender, res) => {
  console.log(msg);
  if (msg.from === 'popup') {
    console.log('popup: ', msg.subject);
    switch (msg.subject) {
      case 'joinRoom': config.joinRoom(msg.room, res); break;
      case 'toggleSync': config.toggleSync(res); break;
      case 'getState': res({ room: config.room, syncPaused: config.syncPaused }); break;
      default: console.error('Err: No action');
    }
  }
});

