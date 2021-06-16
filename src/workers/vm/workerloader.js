export default function createVMWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                // gatsby fast-refresh ignores files with node_modules in path
                "./dist/node_modules/vm-worker.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}
