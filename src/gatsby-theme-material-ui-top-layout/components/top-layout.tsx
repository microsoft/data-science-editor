import React from "react";
// tslint:disable-next-line: no-submodule-imports
import ThemeTopLayout from "gatsby-theme-material-ui-top-layout/src/components/top-layout";

// eslint-disable-next-line react/prop-types
export default function TopLayout({ children, theme }) {
  return <ThemeTopLayout theme={theme}>
        {children}
    </ThemeTopLayout>
}