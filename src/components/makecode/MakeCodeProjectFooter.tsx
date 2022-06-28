import { Link } from "gatsby-theme-material-ui"
import React, { Fragment } from "react"
import { serviceSpecificationFromName } from "../../../jacdac-ts/src/jdom/spec"
import DeviceSpecificationList from "../specification/DeviceSpecificationList"
import PageLinkList from "../ui/PageLinkList"

export default function MakeCodeProjectFooter(props: { serviceNames: string }) {
    const { serviceNames = "" } = props
    const names = serviceNames.split(/\s*,\s*/gi)
    return (
        <>
            <PageLinkList
                header={<h2 id="extensions">Extensions</h2>}
                nodes={names
                    .map(serviceName =>
                        serviceSpecificationFromName(serviceName)
                    )
                    .map(spec => ({
                        slug: `/clients/makecode/extensions/${spec.shortId}/`,
                        title: spec.name,
                        description: spec.notes["short"],
                        services: spec.shortId,
                    }))}
            />{" "}
            <h2 id="devices">Devices</h2>
            {names.length > 1 ? (
                names.map(name => (
                    <DeviceSpecificationList
                        key={name}
                        header={
                            <h3>{serviceSpecificationFromName(name).name}</h3>
                        }
                        serviceName={name}
                        buyNow={true}
                    />
                ))
            ) : (
                <DeviceSpecificationList
                    key={names[0]}
                    serviceName={names[0]}
                    buyNow={true}
                />
            )}
            <h2>See Also</h2>
            <ul>
                <li>
                    <Link to={`/clients/makecode/user-guide/`}>User guide</Link>
                </li>
            </ul>
        </>
    )
}
