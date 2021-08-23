import { Badge } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import JDEvent from "../../../jacdac-ts/src/jdom/event";
import useEventCount from "../../jacdac/useEventCount";

export default function EventBadge(props: { event: JDEvent, color?: "primary" | "secondary" }) {
    const { event, color } = props;
    const { name } = event;
    const count = useEventCount(event);
    const [dot, setDot] = useState(false);
    // start timer to clear dot
    useEffect(() => {
        if (!count) return () => { };

        setDot(true);
        const id = setTimeout(() => setDot(false), 500)
        return () => clearTimeout(id);
    }, [count])

    return <Badge variant={dot ? "dot" : "standard"} color={color}>
        {name}
    </Badge>
}
