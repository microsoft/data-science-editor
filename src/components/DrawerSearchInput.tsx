import React, { useContext, useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import TextField from "@material-ui/core/TextField"
// tslint:disable-next-line: no-submodule-imports
import AppContext from "./AppContext"
import { useId } from "react-use-id-hook"

export default function DrawerSearchInput() {
    const { searchQuery, setSearchQuery } = useContext(AppContext)
    const textId = useId()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }
    return (
        <TextField
            id={textId}
            label="Search"
            margin="normal"
            variant="outlined"
            type="search"
            size="small"
            aria-label="Search documentation"
            value={searchQuery}
            onChange={handleChange}
        />
    )
}
