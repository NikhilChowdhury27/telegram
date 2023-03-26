class ProcessMonitor {
    private alive: boolean;

    constructor() {
        this.alive = false;
        process.on('SIGTERM', () => {
            this.handleSigterm(this);
        });
    }

    isAlive() {
        return this.alive;
    }

    start() {
        console.info('Starting process monitor');
        this.alive = true;
    }

    private handleSigterm(that) {
        console.info('SIGTERM signal received >>>>>');
        that.alive = false;
    }
}

export default new ProcessMonitor();
