import { CHANGE } from "jacdac-ts"
import { identityTransformData, resolveBlockDefinition } from "../toolbox"
import { BlockWithServices, resolveBlockServices } from "../WorkspaceContext"
//import nprogress from "accessible-nprogress"

const PROGRESS_DELAY = 200

export function registerDataSolver(block: BlockWithServices) {
    const { jacdacServices: services } = block
    // register data transforms
    const { transformData } = resolveBlockDefinition(block.type) || {}
    if (!transformData) return

    const applyTransform = async () => {
        if (!block.isEnabled() || block.isInFlyout) return

        // transfer data to the next block
        const nextServices = resolveBlockServices(
            block.nextConnection?.targetBlock()
        )
        try {
            services.setDataWarning(undefined)
            // eslint-disable-next-line @typescript-eslint/ban-types
            let newData: object[]
            if (transformData === identityTransformData) newData = services.data
            else {
                let progressid = setTimeout(() => {
                    progressid = undefined
                    // nprogress.start()
                }, PROGRESS_DELAY)
                try {
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
                } finally {
                    if (progressid) clearTimeout(progressid)
                    else {
                        //nprogress.done()
                    }
                }
            }

            // propagate
            services.transformedData = newData

            // check if pass through
            const def = resolveBlockDefinition(block.type)
            if (def?.passthroughData) newData = services.data

            if (nextServices) nextServices.data = newData
        } catch (e) {
            console.debug(e)
        }
    }
    // apply transform, then register for change
    applyTransform().then(() => services.on(CHANGE, applyTransform))
}
