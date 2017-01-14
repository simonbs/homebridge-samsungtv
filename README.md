# homebridge-samsungtv

Samsung TV plugin for [Homebridge](https://github.com/nfarina/homebridge). Supports turning on and off the TV using HomeKit and Siri.

## Installation

1. Install using `npm install -g git+ssh://git@github.com/simonbs/homebridge-samsungtv.git `
2. Add your Samsung TV to `~/.homebridge/config.json` as shown below.

    ```
    "accessories": [{
      "accessory": "SamsungTV",
      "name": "TV",
      "macAddress": "AA:BB:CC:DD:EE:FF",
      "ipAddress": "192.168.0.1"
    }]
    ```
    
3. Restart homebridge.
4. Your Samsung TV should now appear in your Home app as a switch.

