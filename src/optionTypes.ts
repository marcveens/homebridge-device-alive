type Device = {
    name: string;
    ip?: string;
    mac?: string;
};

export type Options = {
    devices: Device[];
    checkInterval?: number;
};