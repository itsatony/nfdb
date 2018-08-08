var fs = require('fs');
var EventEmitter = require('events');


function persist(type, name, filepath, options) {
  var instance = (type === 'Array') 
    ? []
    : {}  
  ;
  if (!name) {
		name = 'persist_' + Math.ceil(Math.random() * 10000);
	}
	if (!filepath) {
		filepath = process.cwd() + '/' + name + '.persist.json';
  }
  var wrapper = {};
  wrapper = {
    name: name,
    filepath: filepath,
    saveOnChange: false,
    saveInterval: 1000 * 30,
    events: null,
    loadOnInit: true
  };
  wrapper.persistChangeHandler = function() {};
  if (options) {
    for (var n in options) {
      wrapper[n] = options[n];
    }
  }
  if (wrapper.loadOnInit && fs.existsSync(wrapper.filepath)) {
    instance = readDataFromFile(wrapper.filepath, JSON.stringify(instance));
  }
  var handler = {
		get(target, property, receiver) {
			try {
				return new Proxy(target[property], handler);
			} catch (err) {
				return Reflect.get(target, property, receiver);
			}
		},
		defineProperty(target, property, descriptor) {
      wrapper.persistChangeHandler();
      // console.log('def', wrapper);
			return Reflect.defineProperty(target, property, descriptor);
		},
		deleteProperty(target, property) {
      wrapper.persistChangeHandler();
      // console.log('del', wrapper);
			return Reflect.deleteProperty(target, property);
		}
	};
  var pObj = new Proxy(instance, handler);
  
  // handler.get.bind(pObj);
  // handler.defineProperty.bind(pObj);
  // handler.deleteProperty.bind(pObj);

  wrapper.persistChangeHandler = function() {
    if (wrapper.events) {
      wrapper.events.emit(wrapper.name + '_change', pObj);
    }
    if (wrapper.saveOnChange) {
      writeDataToFile(pObj, wrapper);
    }
  }
  if (wrapper.saveInterval) {
    wrapper.saveInterval = setInterval(
      function() {
        writeDataToFile(pObj, wrapper);      
      },
      wrapper.saveInterval
    );
  }
	return pObj;
}

function readDataFromFile(filepath, defaultValueStringified) {
	var content = '{}';
	try {
		content = fs.readFileSync(filepath, 'utf8');
	} catch(err) {
		console.error('{persist} read object error ', err);
	}
	if (!content) {
		return JSON.parse(defaultValueStringified);
	}
  var data = JSON.parse(content);
	return data;
}


function writeDataToFile(pobj, wrapper) {
  // console.log('======= writeToFile: ', wrapper, '===', pobj);
	var content = JSON.stringify(pobj);
	try {
    fs.writeFileSync(wrapper.filepath, content, 'utf8');
    if (wrapper.events) {
      wrapper.events.emit(wrapper.name + '_fswrite', pobj);
    }
	} catch(err) {
		console.error('{persist} write object error ', err);
	}
	return true;
}

module.exports = persist;