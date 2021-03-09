import React, { useMemo } from "react";
import { JDService } from "../../jacdac-ts/src/jdom/service";
import { isRegister } from "../../jacdac-ts/src/jdom/spec";
import RegisterInput from "./RegisterInput";
import useChange from '../jacdac/useChange';
import AutoGrid from "./ui/AutoGrid";
import { JDRegister } from "../../jacdac-ts/src/jdom/register";
import { SystemReg } from "../../jacdac-ts/src/jdom/constants";

export default function ServiceRegisters(props: {
    service: JDService,
    registerIdentifiers?: number[],
    filter?: (register: JDRegister) => boolean,
    showRegisterName?: boolean,
    hideMissingValues?: boolean,
    showTrends?: boolean
}) {
    const { service, registerIdentifiers, filter, showRegisterName, hideMissingValues, showTrends } = props;
    const specification = useChange(service, spec => spec.specification);
    const registers = useMemo(() => {
        const packets = specification?.packets;
        const ids = registerIdentifiers
            || packets
                ?.filter(pkt => isRegister(pkt))
                ?.map(pkt => pkt.identifier);
        let r = ids?.map(id => service.register(id))
            ?.filter(reg => !!reg) || [];
        if (filter)
            r = r.filter(filter);
        return r;
    }, [specification, registerIdentifiers, filter])

    return <AutoGrid spacing={1}>
        {registers.map(register => <RegisterInput key={register.id}
            register={register}
            showRegisterName={showRegisterName}
            hideMissingValues={hideMissingValues}
            showTrend={showTrends && register.code === SystemReg.Reading}
        />)}
    </AutoGrid>
}