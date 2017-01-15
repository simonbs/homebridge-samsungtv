var SamsungTV = require("samsungtv");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-samsungtv", "SamsungTV", SamsungTVAccessory);
}

function SamsungTVAccessory(log, config) {
  this.name = config["name"];
  var port = config["port"] || 8001;
  var appName = config["appName"] || "homebridge";
  this.samsungTV = new SamsungTV(config["macAddress"], config["ipAddress"], port, appName);
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

SamsungTVAccessory.prototype.isOn = function(callback) {
  return this.samsungTV.isOn(callback);
}

SamsungTVAccessory.prototype.setPowerState = function(isOn, callback) {
  if (isOn) {
    this.samsungTV.turnOn(callback);
  } else {
    this.samsungTV.turnOff(callback);
  }
}
