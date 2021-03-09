import React, { useRef, useEffect } from "react";
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants";
import { JDRegister } from "../../../jacdac-ts/src/jdom/register";
import useServiceHost from "../hooks/useServiceHost";
import SvgWidget from "./SvgWidget";
import useWidgetTheme from "./useWidgetTheme";

export default function BytesBarGraphWidget(props: { register: JDRegister, size?: string }) {
    const { register, size } = props;
    const host = useServiceHost(register.service);
    const color = host ? "secondary" : "primary";
    const { background, controlBackground, active } = useWidgetTheme(color)
    const pathRef = useRef<SVGPathElement>();

    const w = 128;
    const h = w / 1.612;
    const m = 2;
    const dy = (h - 2 * m) / 0xff;

    useEffect(() => register.subscribe(CHANGE, () => {
        // render outside of react loop
        const { current } = pathRef;
        const bins = register.data;
        if (!current || !bins) return;

        const dx = (w - 2 * m) / bins.length;
        const dw = (w - 2 * m) / (bins.length * 6)
        let d = `M ${m} ${h - m} `;
        for (let i = 0; i < bins.length; ++i) {
            const bin = bins[i];
            d += ` v ${-dy * bin} h ${dx - dw} v ${dy * bin} h ${dw}`;
        }
        d += ' z';
        current.setAttribute("d", d);
    }), [register])

    return <SvgWidget width={w} height={h} size={size} background={background}>
        <path fill={active} stroke={controlBackground} strokeWidth={m / 2} ref={pathRef} />
    </SvgWidget>
}
