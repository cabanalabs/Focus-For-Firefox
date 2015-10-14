var self = require('sdk/self');
const { viewFor } = require('sdk/view/core');
const { Class } = require('sdk/core/heritage');
const { Unknown } = require('sdk/platform/xpcom');
var { browserWindows: windows } = require("sdk/windows");

var Listener = Class({
    extends: Unknown,
    interfaces: ["nsIWebProgressListener",
                 "nsISupportsWeakReference"],
    oldURL: null,
    processNewURL: function(aProgress, aRequest, aURI) {
        if (aURI.spec == this.oldURL) return;

        // now we know the url is new...
        console.log(aURI.spec+' -- '+aURI.host);
        if (aURI.host == 'dot429.com') {
          // Get current window or tab
          console.log('ok -- '+this);
          viewFor(window).gBrowser.selectedTab.url = 'http://cabanalabs.com';
          console.log('done');
        }
        this.oldURL = aURI.spec;
    },

    onLocationChange: function(aProgress, aRequest, aURI) {
        this.processNewURL(aProgress, aRequest, aURI);
    },

    onStateChange: function() {},
    onProgressChange: function() {},
    onStatusChange: function() {},
    onSecurityChange: function() {}
});

var listener = Listener();

//TODO attach to existing windows
windows.on('open', function(window) {
  viewFor(window).gBrowser.addProgressListener(listener);
});
windows.on('close', function(window) {
  viewFor(window).gBrowser.removeProgressListener(listener);
});
