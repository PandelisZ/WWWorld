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
  let lastRoom = '';

  function assignInputStates() {
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

    // toggleSyncBtn
    if (state.syncPaused) elements.toggleSyncBtn.className = 'unsynced';
    else elements.toggleSyncBtn.className = 'synced';
    function setSyncButtonState(syncPaused) {
      if (syncPaused) elements.toggleSyncBtn.className = 'unsynced';
      else elements.toggleSyncBtn.className = 'synced';
    }
    setSyncButtonState();
    elements.toggleSyncBtn.addEventListener('click', () => {
      sendMsg(
          { from: 'popup', subject: 'toggleState', room: elements.toggleSyncBtn.value },
          newValue => setSyncButtonState(newValue)
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
      console.log('joinRoomBtn.value: ', elements.roomField.value);
      console.log('typeof: ', typeof elements.roomField.value);
      const room = elements.roomField.value;
      const msg = { from: 'popup', subject: 'joinRoom', room };
      console.log(JSON.stringify(msg));
      sendMsg(
          msg,
          room => {
            lastRoom = room;
            assignInputStates();
          }
      );
    }
  });
});
