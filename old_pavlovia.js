// class to allow communication with pavlovia.org api, heavily based on ServerManager.js from PsychoJS
// need to add an option to use navigator.beacon in event of user closing window
// I'm not sure all of these need to be async / await , once a promise is introduced, other things will automatically wait for it to be fullfilled before doing anything
// THOUGH, I think here it may be a substitute for .then() syntax, maybe switch it for uniformity
// add exception catches

class oldPavlovia {
	constructor() {
	}

	// initialise the session
	async start() {
		this.config = await this.getConfig();
		this.session = await this.openSession();
		console.log("starting");
		console.log(this.config);
		console.log(this.session);
		/* These are all valid ways of doing it
		// this way is ugly
		this.config = this.getConfig().then( (value) => {return value;} );
		this.session = this.config.then( () => { return this.openSession().then( (value) => {return value;} ) } );
		this.bigbob = this.session.then( () => { return this.getBigBob().then( (value) => {return value;} ) } );
		// I like this way, the promise objects are passed through
		this.getConfig().then(
			(value) => {this.config = value;}
		).then(
			//() => {return this.openSession();} // I think you can just put this.openSession there, because that is a function
			this.openSession
		).then(
			(value) => {this.session = value;}
		);
		*/
	}

	// end, maybe the start() and end() methods are unnecessary, could take out in future
	async end() {
		this.close = await this.closeSession();
	}

	// get configuration values from the .json pavlovia generates
	async getConfig() {
		const config = await fetch("config.json");
		return await config.json();
	}

	// open the session with pavlovia.org and return the object from pavlovia.org, which contains the session token
	async openSession() {
		const url = this.config.pavlovia.URL
			+ "api/v2/experiments/"
			+ this.config.gitlab.projectId
			+ "/sessions";
		return await this.queryServer(url, "POST", {});
	}

	// close the session
	// for some reason, data uploads are still successful even after the session has closed..?
	async closeSession() {
		const url = this.config.pavlovia.URL
			+ "api/v2/experiments/"
			+ this.config.gitlab.projectId
			+ "/sessions/"
			+ this.session.token;
			//+ "/delete";
		const form = new FormData();
		form.append("isCompleted", true);
		return await this.queryServer(url, "DELETE", form);
	}

	// upload data using our session token
	async uploadData(filename = "serverManager.uploadData_default_name.csv", filecontents = "serverManager.uploadData,default,data") {
		console.log("started uploadData");
		const form = new FormData();
		form.append("key", filename);
		form.append("value", filecontents);
		const url = this.config.pavlovia.URL
			+ "api/v2/experiments/"
			+ this.config.gitlab.projectId
			+ "/sessions/"
			+ this.session.token
			+ "/results";
		return await this.queryServer(url, "POST", form);
	}

	async uploadMedia(filename, blob) {
		// TODO need to add a wait for upload (using check upload status) because otherwise user may exit before its finished uploading!
		console.log("started uploadMedia");
		const form = new FormData();
		form.append("media", blob, filename);
		console.log(form);
		const url = this.config.pavlovia.URL
			+ "api/v2/experiments/"
			+ this.config.gitlab.projectId
			+ "/sessions/"
			+ this.session.token
			+ "/media";
		return await this.queryServer(url, "POST", form);
	}

	// send a query to the server
	async queryServer(url, _method, data) {
		const response = await fetch(url, {
			method: _method,
			mode: "cors",
			cache: "no-cache",
			credentials: "same-origin",
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: data
		});
		const response_json = await response.json();
		//console.log(response_json);
		return response_json;
	}

}
