var request = require("request");
var WebSocket = require("ws");
var wol = require("wake_on_lan");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-samsungtv", "SamsungTV", SamsungTVAccessory);
}

function SamsungTVAccessory(log, config) {
  this.name = config["name"];
  this.macAddress = config["macAddress"];
  this.ipAddress = config["ipAddress"];
  this.port = config["port"] || 8001;
  this.appName = config["appName"] || "homebridge";
  this.encodedAppName = new Buffer(this.appName).toString("base64");
}

SamsungTVAccessory.prototype.getServices = function() {
  var switchService = new Service.Switch(this.name);
  switchService
    .getCharacteristic(Characteristic.On)
    .on("set", this.setPowerState.bind(this))
    .on("get", this.isOn.bind(this));
  return [ switchService ]
}

SamsungTVAccessory.prototype.identify = function(callback) {
  callback();
}

SamsungTVAccessory.prototype.sendKey = function(key, callback) {
  var url = "http://" + this.ipAddress + ":8001/api/v2/channels/samsung.remote.control?name=" + this.encodedAppName;
  var ws = new WebSocket(url, callback);
  ws.on("error", callback);
  ws.on("message", function(data, flags) {
    var cmd = {
      "method": "ms.remote.control",
      "params": {
        "Cmd": "Click",
        "DataOfCmd": key,
        "Option": "false",
        "TypeOfRemote": "SendRemoteKey"
      }
    };
    data = JSON.parse(data);
    if (data.event == "ms.channel.connect") {
      ws.send(JSON.stringify(cmd), callback);
    }
  });
}

SamsungTVAccessory.prototype.waitForTVOn = function(attemptsLeft, callback) {
  var accessory = this;
  wol.wake(this.macAddress, function(err) {
    accessory.isOn(function(err, isOn) {
      if (isOn) {
        callback();
      } else if (attemptsLeft > 0) {
        setTimeout(function() {
          accessory.waitForTVOn(attemptsLeft - 1, callback);
        }, 2000);
      } else {
        callback("Unable to turn on Samsung TV.");
      }
    });
  });
}

SamsungTVAccessory.prototype.turnOn = function(callback) {
  this.waitForTVOn(3, callback);
}

SamsungTVAccessory.prototype.turnOff = function(callback) {
  this.sendKey("KEY_POWER", callback);
}

SamsungTVAccessory.prototype.isOn = function(callback) {
  var url = "http://" + this.ipAddress + ":" + this.port + "/api/v2/";
  return request.get(url, { timeout: 5000 }, function(err, httpResponse, body) {
    if (err || httpResponse.statusCode != 200) {
      callback(null, false);
    } else {
      callback(null, true);
    }
  });
}

SamsungTVAccessory.prototype.setPowerState = function(isOn, callback) {
  if (isOn) {
    this.turnOn(callback);
  } else {
    this.turnOff(callback);
  }
}
