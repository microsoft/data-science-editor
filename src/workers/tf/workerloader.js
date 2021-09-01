export default function createTFWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                "./dist/node_modules/tf-worker.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}
