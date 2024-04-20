class Fluency {
    constructor() {
        this.server_manager = new serverManager();
    }
    start() { // should probably use async here
        this.server_manager.start(); // should probably be await here, this will probably cause an error later
    }
}
