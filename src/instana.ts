if (process.env.ENVIRONMENT === 'production') {
    require('@instana/collector')({
        autoProfile: true
    });
}
