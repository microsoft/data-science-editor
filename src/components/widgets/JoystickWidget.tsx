import React, { useRef, useState, CSSProperties } from "react";
import useAnimationFrame from "../hooks/useAnimationFrame";
import SvgWidget from "./SvgWidget";
import useWidgetTheme from "./useWidgetTheme";


function decay(value: number, rate: number, precision: number) {
    let nv = value * rate;
    if (Math.abs(nv) < precision)
        nv = 0;
    return nv;
}

export default function JoystickWidget(props: {
    x: number, y: number,
    color: "secondary" | "primary",
    onUpdate?: (newx: number, newy: number) => void,
    hostValues?: () => [number, number]
}) {
    const { color, x, y, onUpdate, hostValues } = props;
    const { active, background, controlBackground } = useWidgetTheme(color);
    const dragSurfaceRef = useRef<SVGCircleElement>();
    const [grabbing, setGrabbing] = useState(false)

    const w = 40;
    const w2 = w >> 1;
    const cx = w2;
    const cy = w2;
    const rp = 2
    const rc = 6
    const rj = 10
    const pw = 12
    const ph = 8

    const jx = cx + (x || 0) * rj
    const jy = cy + (y || 0) * rj
    const jw = 1

    const updateJoystickDrag = (x: number, y: number) => {
        const bounds = dragSurfaceRef.current.getBoundingClientRect();

        const dx = ((x - bounds.left) * (w / bounds.width)) - w2;
        const dy = ((y - bounds.top) * (w / bounds.height)) - w2;

        const angle = Math.atan2(dy, dx);
        const distance = Math.min(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)), rj) / rj;

        const newx = distance * Math.cos(angle)
        const newy = distance * Math.sin(angle)

        onUpdate(newx, newy);
    }

    const handlePointerDown = async (ev: React.PointerEvent<SVGCircleElement>) => {
        ev.preventDefault();
        setGrabbing(true)
        updateJoystickDrag(ev.clientX, ev.clientY)
    }
    const handlePointerUp = (ev: React.PointerEvent<SVGCircleElement>) => {
        ev.preventDefault();
        setGrabbing(false)
    }
    const handlePointerMove = async (ev: React.PointerEvent<SVGCircleElement>) => {
        ev.preventDefault();
        if (grabbing)
            updateJoystickDrag(ev.clientX, ev.clientY)
    }

    useAnimationFrame(() => {
        if (!hostValues || grabbing) return false; // let use do its thing
        const [ax, ay] = hostValues()
        const nx = decay(ax, 0.9, 16)
        const ny = decay(ay, 0.9, 16)

        // async
        onUpdate(nx, ny);

        return nx !== 0 || ny !== 0;
    }, [hostValues, grabbing])

    const handleStyle: CSSProperties = {
        cursor: grabbing ? "grabbing" : "grab"
    }

    return <SvgWidget width={w} height={w}>
        <circle ref={dragSurfaceRef} className="joystick-background" cx={cx} cy={cy} r="16" fill={background}></circle>
        <rect className="dpad-up" x={"16"} y="6" width={ph} height={pw} rx={rp} fill={controlBackground}></rect>
        <rect className="dpad-down" x="16" y="22" width={ph} height={pw} rx={rp} fill={controlBackground}></rect>
        <rect className="dpad-right" x="22" y="16" width={pw} height={ph} ry={rp} fill={controlBackground}></rect>
        <rect className="dpad-left" x="6" y="16" width={pw} height={ph} ry={rp} fill={controlBackground}></rect>
        <circle className="dpad-center" cx={cx} cy={cy} r={rc} fill={controlBackground}></circle>
        {hostValues
            ? <circle
                className="joystick-handle"
                cx={jx}
                cy={jy}
                r={rc}
                fill={background}
                stroke={active}
                strokeWidth={jw}
                tabIndex={0}
                role="button"
                aria-label="joystick handle"
                arial-live="polite"
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={handleStyle}
            />
            : <circle
                className="joystick-handle"
                cx={jx}
                cy={jy}
                r={rc}
                fill={background}
                stroke={active}
                strokeWidth={jw}
                aria-label="joystick handle"
            />}
    </SvgWidget>
}
