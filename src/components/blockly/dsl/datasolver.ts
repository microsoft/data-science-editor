import { CHANGE } from "../../../../jacdac-ts/src/jdom/constants"
import { roundWithPrecision } from "../../../../jacdac-ts/src/jdom/utils"
import { identityTransformData, resolveBlockDefinition } from "../toolbox"
import { BlockWithServices } from "../WorkspaceContext"

export function registerDataSolver(block: BlockWithServices) {
    const { jacdacServices: services } = block
    // register data transforms
    const { transformData } = resolveBlockDefinition(block.type) || {}
    if (!transformData) return

    const applyTransform = async () => {
        if (!block.isEnabled() || block.isInFlyout) return

        // transfer data
        const next = (block.nextConnection?.targetBlock() ||
            block.childBlocks_?.[0]) as BlockWithServices
        const nextServices = next?.jacdacServices
        try {
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
                //const end = performance.now()
                //console.debug(
                //    `data ${block.type}: ${roundWithPrecision(
                //        (end - start) / 1000,
                //        3
                //    )}s`
                //)
            }

            // propagte
            services.transformedData = newData
            if (nextServices) nextServices.data = newData
        } catch (e) {
            console.debug(e)
        }
    }
    // apply transform, then register for change
    applyTransform().then(() => services.on(CHANGE, applyTransform))
}
