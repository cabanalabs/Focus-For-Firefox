(function() {
  var onOffText = document.getElementById('onOff');
  var onOffToggle = document.getElementById('onOffToggle');
  // Load
  self.on('message', function(message) {
    switch (message.method) {
      case 'loadBlockList':
        var sitelist = document.getElementById('sitelist');
        sitelist.value = message.value;
        break;
      case 'togglePlugin':
        onOffText.innerHTML = (message.value === 'ON') ? 'ON' : 'OFF';
        onOffToggle.checked = (message.value === 'ON');
        break;
    }
  });

  // Save
  var saveButton = document.getElementById('save');
  var undoButton = document.getElementById('undo');

  // Handle Checkbox
  onOffToggle.onchange = function() {
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
