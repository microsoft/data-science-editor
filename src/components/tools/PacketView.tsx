import React, { useContext } from 'react';
import { makeStyles, createStyles } from '@material-ui/core';
import PacketListItem from '../PacketListItem';
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PacketsContext from '../PacketsContext';
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer'
import PacketFilter from '../PacketFilter';
import { TracePacketProps } from '../../../jacdac-ts/src/jdom/trace/traceview';

const useStyles = makeStyles(() =>
    createStyles({
        items: {
            flex: 1
        }
    })
);

interface VirtualListData {
    packets: TracePacketProps[];
    showTime: boolean;
}

const VirtualPacketItem = (props: { data: VirtualListData }
    & ListChildComponentProps) => {
    const { style, index, data } = props;
    const { packets, showTime } = data
    const packet = packets[index];

    if (!packet)
        return <div key={""} style={style}></div>

    return <div key={packet.key} style={style}>
        <PacketListItem
            packet={packet.packet}
            count={packet.count}
            showTime={showTime} />
    </div>
}

function VirtualPacketList(props: { showTime?: boolean }) {
    const { showTime } = props;
    const classes = useStyles()
    const { packets } = useContext(PacketsContext)
    const itemData: VirtualListData = {
        showTime,
        packets
    }
    return <AutoSizer className={classes.items}>
        {({ height, width }) => (
            <FixedSizeList
                itemCount={packets.length}
                itemSize={54}
                height={height}
                width={width}
                itemData={itemData}>
                {VirtualPacketItem}
            </FixedSizeList>
        )}
    </AutoSizer>
}

export default function PacketView(props: {
    serviceClass?: number,
    showTime?: boolean
}) {
    const { showTime } = props

    return (<>
        <PacketFilter />
        <VirtualPacketList showTime={showTime} />
    </>)
}
