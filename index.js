var {Cc, Ci} = require("chrome");
var utils = require('sdk/window/utils');
var httpRequestObserver =
{
  observe: function(subject, topic, data)
  {
    if (topic == "http-on-modify-request") {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      var host = subject.URI.host;
      // Load and concat blockList
      console.log(ss.storage.blockList);
      var blockList = ss.storage.blockList.replace(/\r/g, "\n").replace(/' '/g,"").replace(/\n\n/g,"\n").split("\n");
      for (var counter=0; counter < blockList.length; counter++) {
        if (subject.URI.host.indexOf(blockList[counter]) > -1) {
          var gBrowser = utils.getMostRecentBrowserWindow().gBrowser;
          var domWin = httpChannel.notificationCallbacks.getInterface(Ci.nsIDOMWindow);
          var browser = gBrowser.getBrowserForDocument(domWin.top.document);
          // Very important to pass the string and *not* the URI object
          browser.loadURI('http://focus.cabanalabs.com/', null, null);
          return true;
        }
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

// Menu Button
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var ss = require("sdk/simple-storage");
var self = require("sdk/self");

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./focus-16.png",
    "32": "./focus-32.png",
    "64": "./focus-64.png"
  },
  onChange: function(state) {
    if (state.checked) {
      panel.show({
        position: button
      });
    }
  }
});

var panel = panels.Panel({
  contentURL: self.data.url('panel.html'),
  contentStyleFile: self.data.url('panel.css'),
  contentScriptFile: self.data.url('panel.js'),
  onShow: function() {
    panel.postMessage({
      'method': 'loadBlockList',
      'value': ss.storage.blockList || ''
    });
  },
  onHide: function() {
    button.state('window', {checked: false});
  },
  onMessage: function(message) {
    switch (message.method) {
      case 'saveBlockList':
        ss.storage.blockList = message.value;
        panel.hide();
      case 'cancelSave':
        panel.postMessage({
          'method': 'loadBlockList',
          'value': ss.storage.blockList || ''
        });
    }
  }
});

/*
TODO:
  Browser Plugin:
    - Setup an on / off listener for:
      https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-prefs#on%28prefName_listener%29
    - Display browser plugin according to state
    - Respond to state changes in the browser
    - When the panel loads, get the current settings for
      the current page / as well as plugin state
    
    - Make sure that the only requests being redirected 
      are those that are typed into the browser
    - Build interface to add lists of blocked sites
    - Test with different kinds of domains
    - Redirect to focus.cabanalabs.com/focus
    - Opt in for Private Browsing in addon settings
  
  Front-end:
    - Make the clock it's own module
    - Make image into a module
    - Save image to local storage

  Server:
    - Setup focus.cabanalabs.com
    - Setup focus.cabanalabs.com/focus
    - Setup focus.cabanalabs.com/shot-of-the-day

  Website:
    - Add a link to focus.cabanalabs.com on the front page
    - Give credit to flaticon for the icons:
      <div>Icon made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed under <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a></div>


 == MVP Profile ==
- Go to a website, be able to block it, edit it's entry, unblock it, pause block
- Edit list of blocked websites
- Show motivational quote - maybe get a database of 200 quotes
- Show the current awesome picture of focus.cabanalabs.com

*/
