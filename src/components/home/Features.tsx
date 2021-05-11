import React from "react"
import SplitGrid from "./SplitGrid"
import { StaticImage } from "gatsby-plugin-image"


export default function Features() {
    return <>
        <SplitGrid
            right={false}
            subtitle={"Connector"}
            description={"Jacdac uses 3-pin custom-designed connectors to quickly interface development boards with sensors, LCDs, relays and more."}
            buttonUrl="/connector"
            image={<StaticImage src={"./mechanicalclickconnector.png"} alt="Jacdac mechanical click connector" />} />


        <SplitGrid
            right={true}
            subtitle={"Protocol"}
            description={"Jacdac devices communicate using packets over a bus, where each device can advertise itself and the set of services it provides. A service provides registers, events and commands to communicate with other devices."}
            buttonUrl="/reference/protocol/"
            image={<StaticImage src={"./bustopology.png"} alt="Four cable joining into a module" />} />

        <SplitGrid
            right={false}
            subtitle={"Service specifications"}
            description={"Jacdac services are specified to abstract the hardware device from the software implementation. The services are comprised of registers, commands and events, along with precise data layout information for each packet."}
            buttonUrl="/services"
            image={<StaticImage src={"./dashboardtemp.png"} alt="A dashboard of humidity temperature module" />} />

        <SplitGrid
            right={true}
            subtitle={"Device catalog"}
            description={"The device catalog lists the registered Jacdac devices that can be automatically detected on the bus. The catalog information provides vendor information, the services supported by a device, firmware, and pictures."}
            buttonUrl="/devices"
            image={<StaticImage src={"./jacdacrhtempmodule.png"} alt="A humidity temperature module" />} />

        <SplitGrid
            right={false}
            subtitle={"Firmware updates"}
            description={"The device catalog is automtically detect, download and flash firmware onto devices."}
            buttonUrl="/tools/updater"
            image={<StaticImage src={"./jacdacsinglergbledmodule.png"} alt="A single color LED module" />} />

        <SplitGrid
            right={true}
            subtitle={"Transport"}
            description={"Jacdac packets are sent serially among physical devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services running in the web browser."}
            buttonUrl={"/reference/protocol/#transport-layer"}
            image={<StaticImage src={"./longcable.png"} alt="A long cable" />} />

        <SplitGrid
            right={false}
            subtitle={"Web simulators and tools"}
            description={"The Jacdac bus can be simulated in the browser and communicate to hardware without any driver or program installation."}
            buttonText="Dasboard"
            buttonUrl="/dashboard"
            image={<StaticImage src={"./dashboardlight.png"} alt="A single color LED module" />}
        />

        <SplitGrid
            right={true}
            subtitle={"JavaScript package"}
            description={"Integrate Jacdac into your web site or node.js application using our TypeScript/JavaScript npm library."}
            buttonUrl="/clients/web"
            imageColumns={3}
            image={<StaticImage src={"./html5.svg"} alt="HTML5 logo" />}
        />
    </>
}
