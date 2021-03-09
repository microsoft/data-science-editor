import React, { useContext, useEffect, useState } from 'react';
import PacketsContext from "./PacketsContext"
import { Box, Slider, useTheme } from "@material-ui/core"
import { useDebounce } from 'use-debounce';
import { prettyDuration } from '../../jacdac-ts/src/jdom/pretty';

export default function TraceTimeFilterRangeSlider() {
    const { trace, timeRange, setTimeRange } = useContext(PacketsContext)
    const [minMax, setMinMax] = useState([0, 1000]);
    const [value, setValue] = useState<number[]>(timeRange)
    const theme = useTheme();
    const [debouncedValue] = useDebounce(value, 1000);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        const mintime = trace?.startTimestamp;
        const maxtime = trace?.endTimestamp;
        const range: number[] = mintime !== undefined && maxtime !== undefined
            && [mintime, maxtime];
        // update range
        setMinMax(range);
        setValue(range);
    }, [trace])

    useEffect(() => {
        setTimeRange(debouncedValue)
    }, [debouncedValue])

    if (!minMax || !debouncedValue)
        return <></>

    return <Box display="flex" pl={theme.spacing(0.25)} pr={theme.spacing(0.25)}>
        <Slider
            min={minMax[0]}
            max={minMax[1]}
            value={value}
            onChange={handleChange}
            valueLabelDisplay="auto"
            getAriaValueText={prettyDuration}
            valueLabelFormat={prettyDuration}
        />
    </Box>
}