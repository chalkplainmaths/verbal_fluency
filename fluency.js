class Fluency {
    constructor() {
        this.server_manager = new serverManager();
    }
    start() {
        this.server_manager.init();
    }
}
