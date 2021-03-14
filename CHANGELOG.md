# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2021-03-14
### Changed
- Changed `OccupancySensor` to `MotionSensor` for better compatibility with HomeKit. 
    - If you have problems with changes not being detected after updating to this version, please remove the old devices, reboot Homebridge and add the devices again. Sorry for the inconvenience. 
- Made sure application doesn't crash when no configuration if provided

## [1.0.4] - 2020-11-02
### Changed
- Mac address should now always be lowercase