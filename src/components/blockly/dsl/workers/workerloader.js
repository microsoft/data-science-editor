export function createCsvWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                // gatsby fast-refresh ignores files with node_modules in path
                "../../../../workers/csv/dist/node_modules/csv-worker.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}

export function createDataWorker() {
    return (
        typeof Window !== "undefined" &&
        new Worker(
            new URL(
                // gatsby fast-refresh ignores files with node_modules in path
                "../../../../workers/data/dist/node_modules/data-worker.js",
                import.meta.url // syntax not supported in typescript
            )
        )
    )
}
