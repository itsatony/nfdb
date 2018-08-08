# nfdb
terribly simplistic kv store for local fs


## nfdb

creates a namespace (object) that will be written to disc (and read from disc upon start).
````
const nfdb = require('nfdb').nfdb;

var myLocalJsonFileStore = nfdb(
  'engagedUserList',                                    // name of the db
  process.cwd() + '/data/engagedUserList.ndfb.json',    // file to save the data in
  {
    saveOnWrite: false,                                 // save data on every data change (this is slow as it's sync and uses JSON.stringify)
    saveInterval: 30000                                 // (additionally) save every X milliseconds .. 
  }
);


myLocalJsonFileStore.set(
  'usernames',
  [
    'user1',
    'user2'
  ]
);

var un = myLocalJsonFileStore.get(
  'usernames'
);
´´´´



## persists

persists will monitor changes to an object/array and persists that single object to disc
````
const persists = require('nfdb').persists;

var pArray1 = persists(
  'Array',                      // works for Array and Object .. fallback is an Object
  'pArray1',                    // name ... currently only used for events
  './pArray1.persist.json',     // filepath for saving
  {                             //options .. 
    saveOnChange: true,         // each change is written to disc
    saveInterval: null,         // a write to disc interval in ms
    loadOnInit: true,           // load 'old' data from the filepath (if it exists)
    events: null,               // if an event-emitter is given, any change will trigger a name + '_change' event and a discwrite a name +'_fswrite' event
  }
);

// NOTE ... re-initializing the persists object will lose all 'watch' effects.


´´´´