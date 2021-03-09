import useDevices from "./useDevices"

export default function useDeviceCount(options?: { ignoreSelf?: boolean }) {
    const devices = useDevices(options);
    return devices.length;
}