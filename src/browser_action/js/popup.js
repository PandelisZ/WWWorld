/**
 * Created by matt on 21/08/2016.
 */
/**
 * *theoretically* correct UX behaviour w/ assigning css classes on logic conditions

 For implementing the UI:
 Theoretically:
 id=‘toggleSync’ has classes:
 'unsynced' when unsynced;
 ‘synced' when synced

 id=‘roomField’ has classes:
 ‘clean' when the input field value has NOT changed since the last join;
 ‘dirty' when the input field value has changed since the last join

 id=‘joinRoom’ has classes:
 ‘greyed’ when the input field has value has NOT changed since the last join;
 ‘active’ when the input field value has changed since the last join
 */

let lastRoom = '';

function sendMsg(msg, cb) {
  chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            msg,
            res => cb(res)
        );
      });
}


window.addEventListener('DOMContentLoaded', () => {
  const elements = {
    toggleSyncBtn: document.getElementById('toggleSync'),
    roomField: document.getElementById('roomField'),
    joinRoomBtn: document.getElementById('joinRoom'),
  };

  function assignInputStates() {
    console.log('elements.roomField.value: ', elements.roomField.value);
    console.log('lastRoom: ', lastRoom);
    if (elements.roomField.value === lastRoom) {
      elements.roomField.className = 'clean';
      elements.joinRoomBtn.className = 'greyed';
    } else {
      elements.roomField.className = 'dirty';
      elements.joinRoomBtn.className = 'active';
    }
  }

  // get state, apply things based on state incl. event listeners.
  sendMsg({ from: 'popup', subject: 'getState' }, state => {
    // state = { room, syncPaused
    console.log('state: ', state);

    // toggleSyncBtn
    function setSyncButtonState(syncPaused) {
      if (syncPaused) {
        elements.toggleSyncBtn.className = 'unsynced';
        elements.toggleSyncBtn.innerText = 'Start Sync';
      } else {
        elements.toggleSyncBtn.className = 'synced';
        elements.toggleSyncBtn.innerText = 'Stop Sync';
      }
    }
    setSyncButtonState(state.syncPaused);

    elements.toggleSyncBtn.addEventListener('click', () => {
      sendMsg(
          { from: 'popup', subject: 'toggleSync', room: elements.toggleSyncBtn.value },
          setSyncButtonState
      );
    });

    // room
    elements.roomField.value = state.room;
    lastRoom = state.room;
    assignInputStates();
    elements.roomField.addEventListener('input', assignInputStates);
  });

  // joinRoom
  elements.joinRoomBtn.addEventListener('click', () => {
    if (elements.joinRoomBtn.className === 'active') {
      const room = elements.roomField.value;
      const msg = { from: 'popup', subject: 'joinRoom', room };
      sendMsg(
          msg,
          room => {
            console.log('room: ', room);
            lastRoom = room;
            assignInputStates();
          }
      );
    }
  });
});
