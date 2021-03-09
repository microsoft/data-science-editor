
import { Grid, Switch } from "@material-ui/core";
import React from "react";
import { RoleManagerReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import { useId } from "react-use-id-hook";

export default function DashboardRoleManager(props: DashboardServiceProps) {
    const { service } = props;
    const autoBindRegister = service.register(RoleManagerReg.AutoBind);
    const [autoBind] = useRegisterUnpackedValue<[boolean]>(autoBindRegister);
    const [allRolesAllocated] = useRegisterUnpackedValue<[boolean]>(service.register(RoleManagerReg.AllRolesAllocated))
    const handleAutoBind = () => autoBindRegister.sendSetBoolAsync(!autoBind, true);
    const autoBindLabel = useId();
    const allRolesLabel = useId();

    return <>
        <Grid item xs={12}>
            <Switch aria-labelledby={allRolesLabel} value={allRolesAllocated} disabled={true} />
            <label id={allRolesLabel}>all roles allocated</label>
        </Grid>
        <Grid item xs={12}>
            <Switch aria-labelledby={autoBindLabel} value={autoBind} onChange={handleAutoBind} />
            <label id={autoBindLabel}>assign roles automatically</label>
        </Grid>
    </>
}