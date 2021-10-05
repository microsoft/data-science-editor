import { Link } from "gatsby-theme-material-ui"
import React from "react"
import Alert from "./ui/Alert"

import { useDrawerSearchResults } from "./useDrawerSearchResults"
import { List, ListItem, ListItemText } from "@material-ui/core"

export default function DrawerSearchResults() {
    const results = useDrawerSearchResults()
    return (
        <List dense={true}>
            {!results.length && (
                <ListItem>
                    <Alert severity="info">no results found</Alert>
                </ListItem>
            )}
            {results.map(result => (
                <Link
                    key={"search" + result.url}
                    to={result.url}
                    aria-label={result.title}
                >
                    <ListItem>
                        <ListItemText
                            primaryTypographyProps={{ color: "textPrimary" }}
                            secondaryTypographyProps={{ color: "textPrimary" }}
                            aria-label={result.title}
                            primary={result.title}
                            secondary={result.url}
                        />
                    </ListItem>
                </Link>
            ))}
        </List>
    )
}
