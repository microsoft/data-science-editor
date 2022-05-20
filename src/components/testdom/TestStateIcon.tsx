import React from "react"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import QuestionMarkIcon from "@mui/icons-material/QuestionMark"
import ErrorIcon from "@mui/icons-material/Error"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import useChange from "../../jacdac/useChange"
import { TestNode } from "../../../jacdac-ts/src/testdom/nodes"
import { TestState } from "../../../jacdac-ts/src/testdom/spec"

export default function TestStateIcon(props: { node: TestNode }) {
    const { node } = props
    const state = useChange(node, _ => _?.state)
    switch (state) {
        case TestState.Running:
            return (
                <HourglassEmptyIcon aria-label="test running" color="action" />
            )
        case TestState.Fail:
            return <ErrorIcon aria-label="test fail" color="error" />
        case TestState.Pass:
            return <CheckCircleIcon aria-label="test pass" color="success" />
        default:
            return (
                <QuestionMarkIcon
                    aria-label="test indeterminate"
                    color="warning"
                />
            )
    }
}
