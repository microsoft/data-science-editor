import { Link } from "gatsby-theme-material-ui"
import React from "react"
import RoleManager from "../../components/tools/RoleManager"

export default function Page() {
    return <>
        <h1>Role Manager</h1>
        <p>
            Use this page to configure the roles of devices using the
        <Link to="/services/rolemanager/">role manager service</Link>.
    </p>
        <RoleManager clearRoles={true} />
    </>
}
