import React, { useRef, useEffect } from "react";
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants";
import { JDRegister } from "../../../jacdac-ts/src/jdom/register";
import useAnimationFrame from "../hooks/useAnimationFrame";
import useServiceServer from "../hooks/useServiceServer";
import SvgWidget from "./SvgWidget";
import useWidgetTheme from "./useWidgetTheme";

export default function TrendWidget(props: { register: JDRegister, min: number, max: number, horizon: number, size?: string }) {
    const { register, min, max, horizon, size } = props;
    const host = useServiceServer(register.service);
    const color = host ? "secondary" : "primary";
    const { background, controlBackground, active } = useWidgetTheme(color)
    const dataRef = useRef<number[]>(undefined);
    const pathRef = useRef<SVGPathElement>();

    const dx = 4;
    const m = 2;
    const w = horizon * dx + 2 * m;
    const h = w / 1.612;
    const dy = (h - 2 * m) / (max - min);

    useEffect(() => {
        dataRef.current = register ? [] : undefined; // reset data
        return register?.subscribe(CHANGE, () => {
            // register new value
            const [v] = register.unpackedValue as [number];
            const data = dataRef.current;
            data.unshift(v);
            while (data.length > horizon)
                data.pop();

        })
    }, [register, horizon, min, max])

    useAnimationFrame(() => {
        // update dom
        const data = dataRef.current;
        if (!data)
            return false; // nothing to render

        if (pathRef.current) {
            let d = `M ${w} ${h} `
            let x = w - m;
            for (let i = 0; i < data.length; ++i) {
                const v = data[i];
                const y = h - m - (v - min) * dy;
                d += `L ${x} ${y}`
                x -= dx;
            }
            d += ` V ${h} z`
            pathRef.current.setAttribute("d", d);
        }
        return true;
    }, [dataRef.current])

    return <SvgWidget width={w} height={h} size={size} background={background}>
        <path fill={active} stroke={controlBackground} strokeWidth={m / 2} ref={pathRef} />
    </SvgWidget>
}
