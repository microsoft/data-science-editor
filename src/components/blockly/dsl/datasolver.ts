import { CHANGE } from "../../../../jacdac-ts/src/jdom/constants"
import { resolveBlockDefinition } from "../toolbox"
import { BlockWithServices } from "../WorkspaceContext"

export function registerDataSolver(block: BlockWithServices) {
    const { jacdacServices: services } = block
    // register data transforms
    const { transformData } = resolveBlockDefinition(block.type) || {}
    if (!transformData) return

    const applyTransform = async () => {
        if (!block.isEnabled() || block.isInFlyout) return

        console.debug(`data transform [${block.id}]#${services.changeId}`)
        // transfer data
        const next = (block.nextConnection?.targetBlock() ||
            block.childBlocks_?.[0]) as BlockWithServices
        const nextServices = next?.jacdacServices
        try {
            const newData = await transformData(
                block,
                services.data,
                nextServices?.data
            )
            services.transformedData = newData
            if (nextServices) nextServices.data = newData
        } catch (e) {
            console.debug(e)
        }
    }
    // apply transform, then register for change
    applyTransform().then(() => services.on(CHANGE, applyTransform))
}
