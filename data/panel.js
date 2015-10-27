(function() {
  // Load
  self.on('message', function(message) {
    switch (message.method) {
      case 'loadBlockList':
        var sitelist = document.getElementById('sitelist');
        sitelist.value = message.value;
    }
  });

  // Save
  var saveButton = document.getElementById('save');
  var undoButton = document.getElementById('undo');

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
