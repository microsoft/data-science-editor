import { CHANGE } from "../../../../jacdac-ts/src/jdom/constants"
import { resolveBlockDefinition } from "../toolbox"
import { BlockWithServices } from "../WorkspaceContext"

export function registerDataSolver(block: BlockWithServices) {
    const { jacdacServices: services } = block
    // register data transforms
    const { transformData, alwaysTransformData } = resolveBlockDefinition(block.type) || {}
    if (!transformData) return

    services.on(CHANGE, async () => {
        if (!block.isEnabled()) return

        // transfer data
        const next = (block.nextConnection?.targetBlock() ||
            block.childBlocks_?.[0]) as BlockWithServices
        const nextServices = next?.jacdacServices
        if (nextServices || alwaysTransformData) {
            try {
                const newData = await transformData(
                    block,
                    services.data,
                    nextServices?.data
                )
                if (nextServices)
                    nextServices.data = newData
            } catch (e) {
                console.debug(e)
            }
        }
    })
}
