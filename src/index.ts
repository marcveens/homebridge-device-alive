import {
    API,
    APIEvent,
    DynamicPlatformPlugin,
    HAP,
    Logging,
    PlatformAccessory,
    PlatformConfig
} from "homebridge";
import findDevices from 'local-devices';
import { Options } from './optionTypes';

type CustomPlatformConfig = PlatformConfig & Options;

const PLUGIN_NAME = "homebridge-device-alive";
const PLATFORM_NAME = "DeviceAlive";

let hap: HAP;
let Accessory: typeof PlatformAccessory;

export = (api: API) => {
    hap = api.hap;
    Accessory = api.platformAccessory;

    api.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, ExampleDynamicPlatform);
};

class ExampleDynamicPlatform implements DynamicPlatformPlugin {

    private readonly log: Logging;
    private readonly api: API;
    private readonly config: CustomPlatformConfig;
    private checkStateInterval?: NodeJS.Timeout;
    private checkStateIntervalTime: number;

    private readonly accessories: PlatformAccessory[] = [];
    private readonly accessoriesToRemove: PlatformAccessory[] = [];

    constructor(log: Logging, defaultConfig: PlatformConfig, api: API) {
        this.log = log;
        this.api = api;
        this.config = defaultConfig as CustomPlatformConfig;
        this.checkStateIntervalTime = this.config.checkInterval || 5000;

        /*
         * When this event is fired, homebridge restored all cached accessories from disk and did call their respective
         * `configureAccessory` method for all of them. Dynamic Platform plugins should only register new accessories
         * after this event was fired, in order to ensure they weren't added to homebridge already.
         * This event can also be used to start discovery of new accessories.
         */
        api.on(APIEvent.DID_FINISH_LAUNCHING, () => {
            this.addNewDevices();
            this.removeOutdatedAccessories();

            this.checkStateInterval = this.initializeWatcher();
        });

        api.on(APIEvent.SHUTDOWN, () => {
            if (this.checkStateInterval) {
                clearInterval(this.checkStateInterval);
            }
        });
    }

    /*
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory: PlatformAccessory): void {
        if (!this.accessoryRegisteredInConfig(accessory)) {
            this.accessoriesToRemove.push(accessory);
        } else {
            this.accessories.push(accessory);
        }
    }

    // --------------------------- CUSTOM METHODS ---------------------------

    /** Initialize watcher which checks if a device is online or not */
    initializeWatcher() {
        return setInterval(
            this.updateAccessoryState.bind(this),
            this.checkStateIntervalTime
        );
    }

    /** Check if devices are online or not */
    updateAccessoryState() {
        findDevices().then(devices => {
            for (let i = 0; i < this.accessories.length; i++) {
                const deviceConfig = this.config.devices.find(d => d.name === this.accessories[i].displayName);
                const service = this.accessories[i].getService(hap.Service.OccupancySensor);
                const status = service?.getCharacteristic(hap.Characteristic.OccupancyDetected).value;
                const deviceIsOnline = devices.find(d => {
                    if (deviceConfig) {
                        return d.ip === deviceConfig.ip || this.fixMac(d.mac) === this.fixMac(deviceConfig.mac);
                    }

                    return false;
                });

                if (!!deviceIsOnline) {
                    // Only turn on if it's not already on
                    if (!status) {
                        this.log(`${deviceConfig?.name} is now online`);
                        service?.updateCharacteristic(hap.Characteristic.OccupancyDetected, hap.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED);
                    }
                } else {
                    // Only turn off if it's not already off 
                    if (!!status) {
                        this.log(`${deviceConfig?.name} is now offline`);
                        service?.updateCharacteristic(hap.Characteristic.OccupancyDetected, hap.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
                    }
                }
            }
        });
    }

    /** Check if accessory is registered in the Homebridge config */
    accessoryRegisteredInConfig(accessory: PlatformAccessory) {
        return this.config.devices.find(d => d.name === accessory.displayName);
    }

    /** Check if accessory is registered in the Homebridge config */
    accessoryMissingInHomebridge(accessory: PlatformAccessory) {
        return this.config.devices.find(d => d.name === accessory.displayName);
    }

    /** Remove outdated accessories from Homebridge */
    removeOutdatedAccessories() {
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessoriesToRemove);
    }

    /** Register unregistered devices to Homebridge */
    addNewDevices() {
        const accessoriesToRegister = this.config.devices.filter(d => !this.accessories.find(a => a.displayName === d.name));

        accessoriesToRegister.forEach(acc => {
            const uuid = hap.uuid.generate(acc.name);
            const accessory = new Accessory(acc.name, uuid);

            accessory.addService(hap.Service.OccupancySensor, acc.name);
            this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        });
    }

    /** Because different sources use different characters for mac addresses. Now always use colon */
    fixMac(address?: string) {
        return (address || '').replace(/-/g, ':').replace(/\./g, ':').toLowerCase();
    }

    // ----------------------------------------------------------------------

}
