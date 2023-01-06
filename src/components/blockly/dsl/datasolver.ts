import { CHANGE } from "../../dom/constants"
import { delay } from "../../dom/utils"
import { identityTransformData, resolveBlockDefinition } from "../toolbox"
import {
    BlockWithServices,
    resolveBlockServices,
    resolveBlockSvg,
} from "../WorkspaceContext"

function startShowTransform(block: BlockWithServices) {
    let blockSvg = resolveBlockSvg(block)
    blockSvg.addSelect()
    blockSvg.setEditable(false)
    return () => {
        blockSvg?.removeSelect()
        blockSvg?.setEditable(true)
        blockSvg = undefined
    }
}

const TRANSFORM_DELAY = 40

export function registerDataSolver(block: BlockWithServices) {
    const { blockServices: services } = block
    // register data transforms
    const { transformData } = resolveBlockDefinition(block.type) || {}
    if (!transformData) return

    const applyTransform = async () => {
        if (!block.isEnabled() || block.isInFlyout) return

        const unshow = startShowTransform(block)
        // transfer data to the next block
        const nextServices = resolveBlockServices(
            block.nextConnection?.targetBlock()
        )
        try {
            services.setDataWarning(undefined)
            await delay(TRANSFORM_DELAY)
            // eslint-disable-next-line @typescript-eslint/ban-types
            let newData: object[]
            if (transformData === identityTransformData) newData = services.data
            else {
                //const start = performance.now()
                newData = await transformData(
                    block,
                    services.data,
                    nextServices?.data
                )
            }

            // propagate
            services.transformedData = newData
            unshow()

            // check if pass through
            const def = resolveBlockDefinition(block.type)
            if (def?.passthroughData) newData = services.data

            if (nextServices) nextServices.data = newData
        } catch (e) {
            console.debug(e)
        } finally {
            unshow()
        }
    }
    // apply transform, then register for change
    applyTransform().then(() => services.on(CHANGE, applyTransform))
}
