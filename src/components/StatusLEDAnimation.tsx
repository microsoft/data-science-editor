import React from "react";
import { statusAnimation } from "./devices/useDeviceStatusLightStyle";
import useLedAnimationStyle from "./hooks/useLedAnimationStyle";
import SvgWidget from "./widgets/SvgWidget"
import Helmet from "react-helmet"
import useWidgetTheme from "./widgets/useWidgetTheme";
import { capitalize } from "@material-ui/core";

export default function StatusLEDAnimation(props: {
    status: "startup" | "identify" | "connected" | "disconnected" | "panic" | "bootloader"
}) {
    const { status } = props;

    let interval = 0;
    let count = 1;
    switch (status) {
        case "connected": count = 5; break;
        case "startup": interval = 2000; break;
        case "identify": interval = 2000; break;
        case "panic": interval = 5000; break;
    }
    const frames = statusAnimation(status);
    const { helmetStyle, className } = useLedAnimationStyle(frames, {
        cssProperty: "fill",
        monochrome: true,
        step: true,
        interval
    });
    const { controlBackground } = useWidgetTheme();

    const n = count || 1;
    const wc = 32;
    const h = wc;
    const w = wc * n + 6;
    const r = (wc >> 1) - 1;
    const cx = wc >> 1;
    const cy = h >> 1;
    return <h2>
        <Helmet>
            <style>{helmetStyle}</style>
        </Helmet>
        <SvgWidget width={w} height={h} size={"1em"}>
            {Array(n).fill(0).map((_, i) => <g key={i} transform={`translate(${wc * i}, 0)`}>
                <circle cx={cx} cy={cy} r={r} fill={controlBackground} />
                <circle cx={cx} cy={cy} r={r} className={className} stroke={controlBackground} strokeWidth={1} />
            </g>)}
        </SvgWidget>
        {capitalize(status)}
    </h2>
}