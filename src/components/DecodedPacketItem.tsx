import React, { useMemo } from "react"
import { DecodedPacket } from "../../jacdac-ts/src/jdom/pretty"
import MembersInput from "./fields/MembersInput"

export default function DecodedPacketItem(props: { pkt: DecodedPacket }) {
    const { pkt } = props
    const { decoded, service } = pkt
    const specifications = useMemo(() => decoded.map(d => d.info), [decoded])
    const values = useMemo(() => decoded.map(d => d.value), [decoded])
    return (
        <MembersInput
            serviceSpecification={service}
            specifications={specifications}
            values={values}
        />
    )
}
