var {Cc, Ci} = require("chrome");
var utils = require('sdk/window/utils');
var rawBlockList = '';
var blockList = '';

// Load the blocklist
var ss = require("sdk/simple-storage");
var pluginState = ss.storage.pluginState || 'ON';
var reloadBlockList = function() {
  rawBlockList = (ss.storage.rawBlockList || '')
  blockList = rawBlockList.toLowerCase().replace(/^#.*\n$/g, "").split("\n");
}

// Intercept and redirect requests here
var httpRequestObserver =
{
  observe: function(subject, topic, data)
  {
    // If referrer is null, that means this request was most likely triggered by the
    // user typing the url into the address bar and pressing enter
    if (pluginState == 'ON' && topic == "http-on-modify-request" && subject.nsIHttpChannel.referrer == null) {
      var requestURL = subject.URI.spec.toLowerCase();
      // Load, and clean up blocklist
      for (var counter=0; counter < blockList.length; counter++) {
        var listItem = blockList[counter].trim();
        if (listItem != '' && requestURL.indexOf(listItem) > -1) {
          var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
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

  observerService: function() {
    return Cc["@mozilla.org/observer-service;1"]
                     .getService(Ci.nsIObserverService);
  },

  register: function()
  {
    this.observerService().addObserver(this, "http-on-modify-request", false);
  },

  unregister: function()
  {
    this.observerService().removeObserver(this, "http-on-modify-request");
  }
};

// Handle menu button
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");


// Setup the button
var getPluginIcon = function(state) {
  if (state === 'ON') {
    return {
      "16": "./focus-16.png",
      "32": "./focus-32.png",
      "64": "./focus-64.png"
    }
  } else {
    return {
      "16": "./rest-16.png",
      "32": "./rest-32.png",
      "64": "./rest-64.png"
    }
  }
}

var setPluginIcon = function(pluginState) {
  button.icon = getPluginIcon(pluginState);
}

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: getPluginIcon(pluginState),
  onChange: function(state) {
    if (state.checked) {
      panel.show({
        position: button
      });
    }
  }
});


// Panel Interaction
var panel = panels.Panel({
  contentURL: self.data.url('panel.html'),
  contentStyleFile: self.data.url('panel.css'),
  contentScriptFile: self.data.url('panel.js'),
  // Initialize Panel with state and information
  onShow: function() {
    panel.postMessage({
      'method': 'loadBlockList',
      'value': rawBlockList
    });
    panel.postMessage({
      'method': 'togglePlugin',
      'value': pluginState
    });
  },
  onHide: function() {
    button.state('window', {checked: false});
  },
  onMessage: function(message) {
    switch (message.method) {
      case 'saveBlockList':
        ss.storage.rawBlockList = message.value;
        reloadBlockList();
        panel.hide();
        break;
      case 'undoSave':
        panel.postMessage({
          'method': 'loadBlockList',
          'value': rawBlockList
        });
        break;
      case 'togglePlugin':
        pluginState = (message.value === true) ? 'ON' : 'OFF';
        setPluginIcon(pluginState);
        ss.storage.pluginState = pluginState;
        panel.postMessage({
          'method': 'togglePlugin',
          'value': pluginState
        });
        break;
    }
  }
});

// Start here
exports.main = function(options, callbacks) {
  reloadBlockList();
  httpRequestObserver.register();
}

// Unload upon upgrade / plugin being disabled etc.
exports.onUnload = function(reason) {
  httpRequestObserver.unregister(); 
}

/*
TODO:
  Browser Plugin:
    - Use the plugin the load remote images and produce the whole page locally?
    - Setup an on / off listener for:
      https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/simple-prefs#on%28prefName_listener%29
    - Display browser plugin according to state
    - Respond to state changes in the browser
    - When the panel loads, get the current settings for
      the current page / as well as plugin state
    
    - Redirect to focus.cabanalabs.com/focus
    - Opt in for Private Browsing in addon settings
    - Always make sure that whatever wallpaper you get, it is appropriate for most sizes.
  
  Front-end:
    - Make the clock it's own module
    - Don't show the clock until it has the time
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
