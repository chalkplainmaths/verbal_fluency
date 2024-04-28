// class to allow communication with the pavlovia api, heavily based off of ServerManager.js in the PsychoJS library

class Pavlovia {
    constructor() {
    }

    // I have put everything in the start() function for now, as there really isn't much, it may become more complicated
    // with error handling though?
    start() {
        return fetch("config.json")
        .then( (value) => {
            this.config = value.json();
            this.url = this.config.pavlovia.url
                + "api/v2/experiments/"
                + this.config.gitlab.projectId
                + "/sessions";
            return fetch(this.url, "POST", {});
        }).then( (value) => {
            this.session = value.json();
            this.url += this.session.token + "/";
        });
    }

    end() {
        
    }

    /*_get_config() {
        return fetch("config.json")
        .then( (value) => {return value.json();} );
    }

    _open_session() {

    }*/

    _close_session() {

    }

    upload_data(filename = "default_filename_from_Pavlovia.upload_data()", filecontents = "default_filecontents_from_Pavlovia.upload_data()") {
        const form = new FormData();
        form.append("key", filename);
        form.append("value", filecontents);
        return this._query_server(this.url + "results", "POST", form);
    }

    upload_media(filename = "default_filename_from_Pavlovia.upload_data()") {

    }

    _query_server(url, method, data) {
        return fetch(url, {
            method: method,
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: data
        }).then ( (value) => {return value.json();} );
    }
}
