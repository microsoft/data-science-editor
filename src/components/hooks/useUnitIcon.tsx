import React from "react";
import HumidityIcon from "../icons/HumidityIcon"
import { resolveUnit } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { SvgIconProps } from "@material-ui/core";

export default (unit: string, props?: SvgIconProps) => {
    const { unit: runit } = resolveUnit(unit) || {};
    switch (runit) {
        case "%RH": return <HumidityIcon {...props} />;
        default: return null;
    }
}