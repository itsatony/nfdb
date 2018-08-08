
var persists = require('../persists');
var assert = require('assert');

// type, name, filepath, options
var pArray1 = persists(
  'Array', 
  'pArray1', 
  './pArray1.persist.json', 
  {
    saveOnChange: true,
    saveInterval: null,
    loadOnInit: false
  }
);
assert.equal(Array.isArray(pArray1), true);
pArray1.push('entry2');
setTimeout(
  function() {
    var pArray2 = persists(
      'Array', 
      'pArray2', 
      './pArray1.persist.json', 
      {
        saveOnChange: false,
        saveInterval: null,
        loadOnInit: true
      }
    );
    assert.equal(pArray2[0], 'entry2');
    assert.equal(pArray2.length, 1);
  },
  500
);


// var pO = persists(
//   'Object', 
//   'myObj', 
//   './myObj.persist.json', 
//   {
//     saveOnChange: true,
//     saveInterval: null
//   }
// );
// assert.equal(typeof pO, 'object');