import { useContext } from "react";
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";
import useChange from '../../jacdac/useChange';

export default function useServices(options: {
    serviceName?: string;
    serviceClass?: number;
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const services = useChange(bus, b => b.services(options)
        , [JSON.stringify(options)])
    return services;
}