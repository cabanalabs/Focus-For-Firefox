(function() {
  // Load
  self.on('message', function(message) {
    switch (message.method) {
      case 'loadBlockList':
        var sitelist = document.getElementById('sitelist');
        sitelist.value = message.value;
        break;
      case 'togglePlugin':
        document.getElementById('onOff').innerHTML = message.value;
        break;
    }
  });

  // Save
  var saveButton = document.getElementById('save');
  var undoButton = document.getElementById('undo');

  // Handle Checkbox
  document.getElementById('onOffToggle').onchange = function() {
    var value = '';
    self.postMessage({
      'method': 'togglePlugin',
      'value': onOffToggle.checked,
    });
  };

  saveButton.onclick = function() {
    var sitelist = document.getElementById('sitelist');
    self.postMessage({
        'method': 'saveBlockList',
        'value': sitelist.value,
    });
  };

  // Revert
  undoButton.onclick = function() {
    self.postMessage({
      'method': 'undoSave'
    });
  };
})();
