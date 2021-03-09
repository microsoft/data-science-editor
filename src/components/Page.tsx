import React, { Fragment } from "react";

// eslint-disable-next-line react/prop-types
const Page = ({ props, children }) => {
    return <Fragment {...props}>{children}</Fragment>
}

export default Page;