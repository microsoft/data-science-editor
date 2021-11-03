import React, { useContext, useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import TextField from "@mui/material/TextField"
// tslint:disable-next-line: no-submodule-imports
import AppContext from "./AppContext"
import { useId } from "react-use-id-hook"
import { InputAdornment } from "@mui/material"
import ClearIcon from "@mui/icons-material/Clear"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
import { delay } from "../../jacdac-ts/src/jdom/utils"

export default function DrawerSearchInput() {
    const { searchQuery, setSearchQuery } = useContext(AppContext)
    const [focused, setFocused] = useState(false)
    const textId = useId()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }
    const handleClear = () => setSearchQuery("")
    const handleFocus = () => setFocused(true)
    const handleBlur = async () => {
        await delay(200)
        setFocused(false)
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
            onFocus={handleFocus}
            onBlur={handleBlur}
            InputProps={
                focused
                    ? {
                          endAdornment: (
                              <InputAdornment position="end">
                                  <IconButtonWithTooltip
                                      trackName="search.clear"
                                      title="clear"
                                      size="small"
                                      onClick={handleClear}
                                  >
                                      <ClearIcon />
                                  </IconButtonWithTooltip>
                              </InputAdornment>
                          ),
                      }
                    : undefined
            }
        />
    )
}
