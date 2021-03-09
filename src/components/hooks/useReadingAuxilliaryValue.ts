import { useEffect, useState } from "react";
import { REPORT_UPDATE, SystemReg } from "../../../jacdac-ts/src/jdom/constants";
import { JDRegister } from "../../../jacdac-ts/src/jdom/register";


export default function useReadingAuxilliaryValue(register: JDRegister, identifier: number =
    SystemReg.ReadingError
    | SystemReg.ReadingResolution
    | SystemReg.MaxReading
    | SystemReg.MinReading
    | SystemReg.StreamingInterval
    | SystemReg.StreamingPreferredInterval
): number[] {
    const { service, code } = register;
    const reading = code === SystemReg.Reading || code === SystemReg.Value;
    const auxilliaryRegister = reading ? service.register(identifier) : undefined;
    const [value, setValue] = useState<number[]>(auxilliaryRegister?.unpackedValue);

    useEffect(() => auxilliaryRegister?.subscribe(REPORT_UPDATE, () => {
        setValue(auxilliaryRegister?.unpackedValue);
    }), [register, auxilliaryRegister]);

    return value;
}
