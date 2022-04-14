import { Link } from "gatsby-theme-material-ui"
import React from "react"
import Alert from "../ui/Alert"

import { useDrawerSearchResults } from "./useDrawerSearchResults"
import { List, ListItem, ListItemText } from "@mui/material"

export default function DrawerSearchResults(props: {
    searchQuery: string
}) {
    const { searchQuery } = props
    const results = useDrawerSearchResults(searchQuery)
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
                            secondaryTypographyProps={{
                                color: "textSecondary",
                            }}
                            aria-label={result.title}
                            primary={result.title}
                            secondary={result.url?.slice(0)}
                        />
                    </ListItem>
                </Link>
            ))}
        </List>
    )
}
