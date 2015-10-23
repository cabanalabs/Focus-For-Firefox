self.on('message', function(message) {
  switch (message.method) {
    case 'loadBlockList':
      var sitelist = document.getElementById('sitelist');
      sitelist.value = message.value;
  }
});

// Save code
var saveButton = document.getElementById('save');
var cancelButton = document.getElementById('cancel');

saveButton.onclick = function() {
  var sitelist = document.getElementById('sitelist');
  self.postMessage({
      'method': 'saveBlockList',
      'value': sitelist.value,
  });
};

cancelButton.onclick = function() {
  self.postMessage({
    'method': 'cancelSave'
  });
};
