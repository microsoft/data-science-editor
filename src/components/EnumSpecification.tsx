import React, { Fragment } from "react"
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec"
import { Chip } from "@material-ui/core"

export default function EnumSpecification(props: { serviceClass: number }) {
    const { serviceClass } = props
    const spec = serviceSpecificationFromClassIdentifier(serviceClass)
    const enums = Object.values(spec?.enums || {}).filter(en => !en.derived)
    if (!enums.length)
        return <></>

    return <Fragment>
        <h2>Enums</h2>
        {enums.map(e => <Fragment key={e.name}>
            <h3>{e.name} {e.isFlags && <Chip label="flags" size="small" />}</h3>
            <ul>
                {Object.keys(e.members).map(en => <li key={en}>{en}: <code>0x{e.members[en].toString(16)}</code></li>)}
            </ul>
        </Fragment>)}
    </Fragment>
}
