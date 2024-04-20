class serverManager {
	constructor() {
		this.url_params = new URLSearchParams( window.location.search.slice(1) );
	}
	async init() {
		const result = await this.getConfig();
		this.openSession();
	}
	async getConfig() {
		const config = await fetch("config.json");
		this.config_json = await config.json();
		return 0;
	}
	async openSession() {
		const form = {};
		const url = await this.config_json.pavlovia.URL;
		const id = await this.config_json.gitlab.projectId;
		const full_url = url + "api/v2/experiments/" + id + "/sessions";
		this.session_data = await fetch(full_url, {
			method: "POST",
			mode: "cors",
			credentials: "same-origin",
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: form
		}).json();
	}
	async closeSession() {
	}
	async uploadData() {
	}
	async uploadMedia() {
	}
}
