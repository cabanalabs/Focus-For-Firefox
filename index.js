var {Cc, Ci} = require("chrome");
var utils = require('sdk/window/utils');
var httpRequestObserver =
{
  observe: function(subject, topic, data)
  {
    if (topic == "http-on-modify-request") {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      var host = subject.URI.host;
      if (subject.URI.host == 'dot429.com') {
        var gBrowser = utils.getMostRecentBrowserWindow().gBrowser;
        var domWin = httpChannel.notificationCallbacks.getInterface(Ci.nsIDOMWindow);
        var browser = gBrowser.getBrowserForDocument(domWin.top.document);
        // Very important to pass the string and *not* the URI object
        browser.loadURI('http://www.cabanalabs.com/', null, null);
      }
    }
  },

  get observerService() {
    return Cc["@mozilla.org/observer-service;1"]
                     .getService(Ci.nsIObserverService);
  },

  register: function()
  {
    this.observerService.addObserver(this, "http-on-modify-request", false);
  },

  unregister: function()
  {
    this.observerService.removeObserver(this, "http-on-modify-request");
  }
};

httpRequestObserver.register();
