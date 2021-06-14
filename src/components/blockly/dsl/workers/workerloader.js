export default function createWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                // gatsby fast-refresh ignores files with node_modules in path
                "../../../../workers/dist/node_modules/jacdac-docs-workers.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}
