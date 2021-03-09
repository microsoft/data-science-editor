import React, { createContext } from "react";
import { JDBus, BusState } from "../../jacdac-ts/src/jdom/bus";
export interface JacdacContextProps {
    bus: JDBus,
    connectionState: BusState,
    connectAsync: () => Promise<void>,
    disconnectAsync: () => Promise<void>
}

const JacdacContext = createContext<JacdacContextProps>({
    bus: undefined,
    connectionState: BusState.Disconnected,
    connectAsync: undefined,
    disconnectAsync: undefined
});
JacdacContext.displayName = "Jacdac";

export default JacdacContext;