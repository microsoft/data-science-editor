export default function createCadWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                "./dist/node_modules/cad-worker.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}