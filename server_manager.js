class serverManager {
	constructor() {
		this.url_params = new URLSearchParams( window.location.search.slice(1) );
	}
	init() {
		new Promise(
			function(resolve, reject) {
				this.getConfig();
				return 0;
			}
		).then(
			function(result) {
				this.openSession();
				return 0;
			}
		)
	}
	async getConfig() {
		const config = await fetch("config.json");
		this.config_json = await config.json();
	}
	async openSession() {
		const form = {};
		const url = await this.config_json.pavlovia.URL;
		const id = await this.config_json.gitlab.projectId;
		const full_url = url + "api/v2/experiments/" + id + "/sessions";
		this.token = await fetch(full_url, {
			method: "POST",
			mode: "cors",
			credentials: "same-origin",
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: form
		});
	}
	async closeSession() {
	}
	async uploadData() {
	}
	async uploadMedia() {
	}
}
