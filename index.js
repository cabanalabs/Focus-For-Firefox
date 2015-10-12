var self = require('sdk/self');
var {Cc, Ci,Cu} = require("chrome");
var {XPCOMUtils} = Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var windows = require("sdk/windows").browserWindows;
var listener = {
    oldURL: null,
    processNewURL: function(aURI) {
        if (aURI.spec == this.oldURL) return;

        // now we know the url is new...
        alert(aURI.spec);
        this.oldURL = aURI.spec;
    },

    // nsIWebProgressListener
    QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
                                           "nsISupportsWeakReference"]),

    onLocationChange: function(aProgress, aRequest, aURI) {
        this.processNewURL(aURI);
    },

    onStateChange: function() {},
    onProgressChange: function() {},
    onStatusChange: function() {},
    onSecurityChange: function() {}
};
windows.on('open', function(window) {
  gBrowser.addProgressListener(listener);
});
windows.on('close', function(window) {
  gBrowser.removeProgressListener(listener);
});
