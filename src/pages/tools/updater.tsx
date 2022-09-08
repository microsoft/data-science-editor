import React from "react"
import Flash from "../../components/tools/Flash"

export const frontmatter = {
    title: "Firmware Updater",
    description: "Upgrade devices to the latest firmware version.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />

export default function Page() {
    return (
        <>
            <h1>Firmware Updater</h1>
            <p>
                This page allows you to update your Jacdac module with new
                firmware. Find the latest UF2 firmware file from your
                manufacturer and import it with the button below.
            </p>
            <Flash />
        </>
    )
}
