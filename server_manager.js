// class to allow communication with pavlovia.org api, heavily based on ServerManager.js from PsychoJS
// need to add an option to use navigator.beacon in event of user closing window

class serverManager {
	constructor() {
	}

	// initialise the session
	async init() {
		await this.getConfig();
		this.openSession();
	}

	// get configuration values from the .json pavlovia generates
	async getConfig() {
		const config = await fetch("config.json");
		this.config_json = await config.json();
		return 0;
	}

	// open the session with pavlovia.org and store related data (e.g. the session token)
	async openSession() {
		const url = this.config_json.pavlovia.URL
			+ "api/v2/experiments/"
			+ this.config_json.gitlab.projectId
			+ "/sessions";
		this.session = await this.queryServer(url, "POST", {});
	}

	// close the session
	async closeSession() {
		const url = this.config_json.pavlovia.URL
			+ "api/v2/experiments/"
			+ this.config_json.gitlab.projectId
			+ "/sessions/"
			+ this.session.token
			+ "delete";
		const form = new FormData();
		form.append("isCompleted", true);
		const response = await this.queryServer(url, "DELETE", form);
	}

	// upload data using our session token
	async uploadData(filename = "serverManager.uploadData_default_name.csv", filecontents = "serverManager.uploadData,default,data") {
		const form = new FormData();
		form.append("key", filename);
		form.append("value", filecontents);
		const url = this.config_json.pavlovia.URL
			+ "api/v2/experiments/"
			+ this.config_json.gitlab.projectId
			+ "/sessions/"
			+ this.session.token
			+ "/results";
		const response = await this.queryServer(url, "POST", form);
	}

	// send a query to the server
	async queryServer(url, _method, data) {
		const response = await fetch(url, {
			method: _method,
			mode: "cors",
			credentials: "same-origin",
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: data
		});
		const response_json = await response.json();
		return response_json;
	}

	//
	async uploadMedia() {
	}
}
