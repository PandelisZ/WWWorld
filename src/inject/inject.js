let ytVideo;

chrome.runtime.sendMessage({
  from: 'content',
  subject: 'joinRoom',
  room: 'room',
});

function Config(host) {
  const self = this;

  this.host = host || console.error('Provide a host.');

  /* syncPaused */
  this.syncPaused = undefined;
  chrome.storage.sync.get('paused', obj => {
    self.syncPaused = obj.paused;
  });
  this.setSyncPaused = (val, cb) => chrome.storage.sync.set({ paused: val }, cb);
  this.getSyncPaused = cb => {
    chrome.storage.sync.get('paused', obj => {
      cb(obj.paused);
    });
  };
  this.getSyncPaused(paused => {
    if (paused === undefined) self.setSyncPaused(true);
  });
  this.toggleSync = cb => {
    const newVal = !self.syncPaused;
    self.setSyncPaused(newVal, () => {
      cb(newVal);
    });
  };

  /* rooms */
  this.room = '';
  this.joinRoom = (newRoom, joinedCb) => {
    const normalisedNewRoom = (newRoom || 'default').trim().replace(' ', '-').toLowerCase();
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
        if (joinedCb) joinedCb(self.room);

        /*
        if (!self.syncPaused) {
          doc.mutate(data => {
            console.log('mutateCb');
            changeTime(data.time);
          }).then(data => {
            console.log('mutateCb then');
            changeTime(data.time);
          }
          ).catch(err => console.log(err));
        }*/

        doc.on('updated', data => {
          console.log('remote updated');
          changeTime(data.time);
        });
      }).catch(err => {
        console.log('documentErr', err);
      });

      ytVideo.onplay = () => {
        config.client.document(self.room).then(doc => {
          if (!self.syncPaused) {
            doc.mutate(data => {
              console.log('onplay mutate cb');
              data.time = ytVideo.currentTime;
              return data;
            });
          }
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
    ytVideo = $('video')[0];

    $('head').append('<script type=\'text/javascript\' src=\'https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js\'>');
    $('head').append('<script type=\'text/javascript\' src=\'https://media.twiliocdn.com/sdk/js/sync/v0.2/twilio-sync.min.js\'>');
    $('head').append('<style>.wwwatch-buttons{background-color:white; width: 100%; height: 80px; margin-bottom: 10px; box-shadow: 0 1px 2px rgba(0,0,0,.1);}</style>');

    fetchAccessToken(authData => {
      config.client = new Twilio.Sync.Client(new Twilio.AccessManager(authData.token));
      console.log('You are: ' + config.client.accessManager.identity);

      chrome.storage.onChanged.addListener((changes, namespace) => {
        const roomChanges = changes.room;
        if (roomChanges) {
          console.log(roomChanges.oldValue + ' => ' + roomChanges.newValue);
          config.joinRoom(roomChanges.newValue);
        }

        const pausedChanges = changes.paused;
        if (pausedChanges) config.syncPaused = pausedChanges.newValue;
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

const MIN_LATENCY = 0.3;
function changeTime(time) {
  console.log(time);
  if (!config.syncPaused) {
    ytVideo.currentTime = time + MIN_LATENCY || 0;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, res) => {
  console.log(msg);
  if (msg.from === 'popup') {
    console.log('popup: ', msg.subject);
    switch (msg.subject) {
      case 'joinRoom':
        config.joinRoom(msg.room, res);
        return true;
        break;
      case 'toggleSync':
        config.toggleSync(res);
        return true;
        break;
      case 'getState':
        res({ room: config.room, syncPaused: config.syncPaused });
        break;
      default: console.error('Err: No action');
    }
    return false;
  }
});

