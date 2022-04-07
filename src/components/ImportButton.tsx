import React, { ChangeEvent } from "react"
import { Button } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser"
import IconButton from "@mui/material/IconButton"
import { toArray } from "../../jacdac-ts/src/jdom/utils"
import { useId } from "react"

const MAX_SIZE = 5000000

export default function ImportButton(props: {
    icon?: boolean
    text: string
    onFilesUploaded: (files: File[]) => void
    disabled?: boolean
    acceptedFiles?: string[]
    multiple?: boolean
    className?: string
}) {
    const {
        text,
        onFilesUploaded,
        disabled,
        acceptedFiles,
        icon,
        multiple,
        className,
    } = props
    const inputId = useId()
    const handleSave = (ev: ChangeEvent<HTMLInputElement>) => {
        const { target } = ev
        const files = toArray(target.files)?.filter(f => f.size < MAX_SIZE)
        if (files?.length) onFilesUploaded(files)
    }
    const ip = (
        <input
            id={inputId}
            type="file"
            hidden
            accept={acceptedFiles?.join(",")}
            multiple={multiple}
            onChange={handleSave}
        />
    )

    return icon ? (
        <label htmlFor={inputId}>
            <IconButton
                title={text || "import"}
                className={className}
                disabled={disabled}
                component="span"
            >
                <OpenInBrowserIcon />
                {ip}
            </IconButton>
        </label>
    ) : (
        <Button
            className={className}
            variant="contained"
            component="label"
            disabled={disabled}
            startIcon={icon || <OpenInBrowserIcon />}
        >
            {text || "import"}
            {ip}
        </Button>
    )
}
