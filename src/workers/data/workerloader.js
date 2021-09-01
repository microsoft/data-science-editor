export default function createDataWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                "./dist/node_modules/data-worker.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}
