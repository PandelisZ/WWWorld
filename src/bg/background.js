// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
var config = {};

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    if (msg.from === 'content' && msg.subject === 'config') {
      chrome.pageAction.show(sender.tab.id);
    }
});

