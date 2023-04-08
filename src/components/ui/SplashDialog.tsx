import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React, { useState } from "react";
import { useLocationSearchParamBoolean } from "../hooks/useLocationSearchParam";
import { Button } from "gatsby-theme-material-ui";

let _firstShow = true;
export default function SplashDialog() {
    const hide = useLocationSearchParamBoolean("hidesplash", false);
    const [open, setOpen] = useState(_firstShow);

    const handleClose = () => {
        _firstShow = false;
        setOpen(false);
    };

    if (hide) return null;

    return (
        <Dialog open={open} onAbort={handleClose}>
            <DialogTitle>Data Science Editor</DialogTitle>
            <DialogContent>
                <>
                    <p>
                        Drag and drop blocks to analyse data. Each block
                        receives a dataset, transforms it or analyzes it, and
                        passes it to the next block. Use 👀 to preview changes.
                    </p>
                    <video
                        style={{ width: "100%", aspectRatio: "16/9" }}
                        aria-label="A program where blocks are used to sort and display calories in cereals"
                        playsInline
                        controls={false}
                        autoPlay={true}
                        disablePictureInPicture={true}
                        muted={true}
                        loop={true}
                    >
                        <source
                            src="https://microsoft.github.io/data-science-editor/videos/cereal-calories-sort.mp4"
                            type="video/mp4"
                        />
                        Sorry, your browser does not support embedded videos.
                    </video>
                </>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" to="/about">
                    About
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClose}
                >
                    Get Started!
                </Button>
            </DialogActions>
        </Dialog>
    );
}
