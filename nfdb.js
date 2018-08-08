const fs = require('fs');
const EventEmitter = require('events');
const persists = require('./persists');


function nfdb(name, filepath, options) {
	if (!name) {
		name = 'nfdb_' + Math.ceil(Math.random() * 10000);
	}
	if (!filepath) {
		filepath = __dirname + '/' + name + '.nfdb.json';
  }
  this.options = {
    saveOnWrite: false,
    saveInterval: 1000 * 30
  };
  if (options) {
    for (var n in options) {
      this.options[n] = options[n];
    }
  }
	return new NFDB(name, filepath, this.options);
}



function NFDB(name, filepath, options) {
	var thisNFDB = this;
	this.name = name;
  this.filepath = filepath;
  this.options = options;
  this.events = new EventEmitter();
	this._data = {};
	this.readDataFromFile();
	this.saveInterval = setInterval(
	 function() {
		 thisNFDB.writeDataToFile();
	 },
	 thisNFDB.saveInterval
  );
  this.readDataFromFile();
	this._changedSinceWrite = false;
}

NFDB.prototype.set = function(key, value, forceSave) {
	this._data[key] = value;
	this._changedSinceWrite = true;
	if (forceSave || this.options.saveOnWrite) {
		this.writeDataToFile();
  }
  this.events.emit('change', this._data[key]);
	return this._data[key];
}

NFDB.prototype.watch = function(key, valueObj, forceSave) {
	var thisNFDB = this;
  this._data[key] = valueObj;
  const watchedObject = onChange(
    valueObj, () => {
      thisNFDB._data[key] = valueObj;
      thisNFDB.events.emit('change', this._data[key]);
    }
  );
	this._changedSinceWrite = true;
	if (forceSave || this.options.saveOnWrite) {
		this.writeDataToFile();
  }
  this.events.emit('change', this._data[key]);
	return this._data[key];
}

NFDB.prototype.use = function(key) {
	return this._data[key];
}

NFDB.prototype.get = function(key) {
	if (typeof this._data[key] !== 'undefined') {
		return this._data[key];
	}
	return null;
}

NFDB.prototype.readDataFromFile = function() {
	var content = '{}';
	try {
		content = fs.readFileSync(this.filepath, 'utf8');
    this.events.emit('fullread', this._data);
	} catch(err) {
		log.error('NDB read db error ', err);
	}
	if (!content) {
		content = '{}';
	}
	var data = JSON.parse(content);
  this._data = data;
	return data;
}


NFDB.prototype.writeDataToFile = function(force) {
	if (
		this._changedSinceWrite === false
		&& !force
	) {
		return false;
	}
	var content = JSON.stringify(this._data);
	this._changedSinceWrite = false;
	try {
    content = fs.writeFileSync(this.filepath, content, 'utf8');
    this.events.emit('fswrite', this._data);
	} catch(err) {
		log.error('NDB write db error ', err);
    this._changedSinceWrite = true;
	}
	return true;
}


module.exports = { nfdb: nfdb, persists: persists };