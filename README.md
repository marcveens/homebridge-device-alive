<span align="center">

# homebridge-device-alive

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![homebridge-device-alive](https://badgen.net/npm/v/homebridge-device-alive?icon=npm)](https://www.npmjs.com/package/homebridge-device-alive)
[![mit-license](https://badgen.net/npm/license/homebridge-device-alive)](https://github.com/marcveens/homebridge-device-alive/blob/master/LICENSE)

</span>

`homebridge-device-alive` is a plugin for homebridge which allows you to check if a device is online in your network. It supports both IP addresses and MAC addresses, but only either of them is used per `device` configuration. It uses a Homebridge Motion Sensor accessory to indicate if a device is available on the local network. 

## Installation

If you are new to homebridge, please first read the homebridge [documentation](https://www.npmjs.com/package/homebridge).
If you are running on a Raspberry, you will find a tutorial in the [homebridge wiki](https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Raspbian).

Install homebridge:
```sh
sudo npm install -g homebridge
```

Install homebridge-device-alive:
```sh
sudo npm install -g homebridge-device-alive
```

## Configuration

Add the `DeviceAlive` platform in `config.json` in your home directory inside `.homebridge`.

Example configuration:

```js
{
  "platforms": [
    {
        "platform": "DeviceAlive",
        "checkInterval": 5000,
        "devices": [
            {
                "name": "Soundbar",
                "mac": "ff:ff:ff:ff:ff:ff"
            },
            {
                "name": "Phone",
                "ip": "192.168.172.10"
            }
        ],
    }
  ]
}
```

Every device stated in the config will be automatically added as an accessory to HomeKit. 

#### Platform Configuration fields
Property | Required? | Remarks
--- | :-: | ---
`platform` | :heavy_check_mark: | Should always be **"DeviceAlive"**.
`changeChecks` | :heavy_check_mark: | A list of your devices.


#### Device Configuration fields
Either MAC or IP address is required. 

Property | Required? | Remarks
--- | :-: | ---
`name` | :heavy_check_mark: | Name of the device you want to add
`mac` | | Mac address of the device you want to check on your local network. Should be in lowercase.
`ip` |  | IP address of the device you want to check on your local network

### Backstory
This plugin is actually developed for use in Apple Shortcuts. I had a problem where I wanted to use a IR blaster to turn on and off some devices, but only had 1 signal for both statuses. I could not check if the device was already turned off when I ran a shortcut, thus the device would turn on again. This plugin can make sure no signal is sent if the device is already turned off.  
