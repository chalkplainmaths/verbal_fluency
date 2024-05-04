// class to allow communication with the pavlovia api, heavily based off of ServerManager.js in the PsychoJS library

class Pavlovia {
    constructor() {
    }

    // I have put everything in the start() function for now, as there really isn't much, it may become more complicated
    // with error handling though?
    start() {
        return fetch("config.json")
        .then( (value) => {return value.json();})
        .then( (value) => {
            //this.config = value.json();
            this.config = value;
            this.url = this.config.pavlovia.URL
                + "api/v2/experiments/"
                + this.config.gitlab.projectId
                + "/sessions";
            return this._query_server(this.url, "POST");
        }).then( (value) => {
            this.session = value;
            this.url += "/" + this.session.token;
        });
    }

    end() {
        const form = new FormData;
        form.append("isCompleted", true);
        return this._query_server(this.url, "DELETE", form);
    }

    upload_data(filename = "default_filename_from_Pavlovia.upload_data()", filecontents = "default_filecontents_from_Pavlovia.upload_data()") {
        const form = new FormData();
        form.append("key", filename);
        form.append("value", filecontents);
        return this._query_server(this.url + "/results", "POST", form);
    }

    upload_media(filename = "default_filename_from_Pavlovia.upload_media()", blob = new Blob()) {
        const form = new FormData();
        form.append("media", blob, filename);
        return this._query_server(this.url + "/media", "POST", form)
        .then( (response) => {
            const status_url = this.url
                + "/media/"
                + response.uploadToken
                + "/status";
            return new Promise( (resolve) => {
                const interval = setInterval( () => {
                    this._query_server(status_url, "GET")
                    .then( (status) => {
                        if (status.status === "COMPLETED") {
                            clearInterval(interval);
                            resolve();
                        }
                    });
                }, 500);
            });
        });
    }

    _query_server(url, method, data = new FormData) {
        const request = {
            method: method,
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
        }
        if (method == "POST" || method == "DELETE")
            request.body = data;
        return fetch(url, request)
        .then ( (value) => {return value.json();} );
    }
}
