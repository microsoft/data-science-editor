module.exports = {
    ci: {
        collect: {
            startServerCommand: 'yarn docsserve',
            url: ['http://localhost:9000/'],
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
};