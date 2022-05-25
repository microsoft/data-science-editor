import React, { startTransition, useContext, useEffect, useState } from "react"
import PacketListItem from "../PacketListItem"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PacketsContext from "../PacketsContext"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import { FixedSizeList, ListChildComponentProps } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import PacketFilter from "../PacketFilter"
import { TracePacketProps } from "../../../jacdac-ts/src/jdom/trace/traceview"
import { CHANGE } from "../../../jacdac-ts/src/jdom/constants"

interface VirtualListData {
    packets: TracePacketProps[]
    showTime: boolean
}

function VirtualPacketItem(
    props: { data: VirtualListData } & ListChildComponentProps
) {
    const { style, index, data } = props
    const { packets, showTime } = data as VirtualListData
    const packet = packets[index]

    if (!packet) return null

    return (
        <div key={packet.key} style={style}>
            <PacketListItem
                packet={packet.packet}
                count={packet.count}
                showTime={showTime}
            />
        </div>
    )
}

function VirtualPacketList(props: { showTime?: boolean }) {
    const { showTime } = props
    const { view } = useContext(PacketsContext)
    const [packets, setPackets] = useState<TracePacketProps[]>(
        view.filteredPackets
    )

    useEffect(
        () =>
            view?.subscribe(CHANGE, () =>
                startTransition(() => setPackets(view.filteredPackets))
            ),
        [view]
    )

    const itemData: VirtualListData = {
        showTime,
        packets,
    }
    return (
        <AutoSizer style={{ flex: 1 }}>
            {({ height, width }) => (
                <FixedSizeList
                    itemCount={packets.length}
                    itemSize={54}
                    height={height}
                    width={width}
                    itemData={itemData}
                >
                    {VirtualPacketItem}
                </FixedSizeList>
            )}
        </AutoSizer>
    )
}

export default function PacketView(props: {
    serviceClass?: number
    showTime?: boolean
}) {
    const { showTime } = props

    return (
        <>
            <PacketFilter />
            <VirtualPacketList showTime={showTime} />
        </>
    )
}
