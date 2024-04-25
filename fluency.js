//const pavlovia = new Pavlovia();

function create_form(message) {
	const div = document.createElement("div");
	const form = div.appendChild(document.createElement("form"));
	form.appendChild(document.createElement("label"));
	form.appendChild(document.createElement("input"));
	form.appendChild(document.createElement("input"));
	form.getElementsByTagName("label")[0].innerHTML = message;
	form.getElementsByTagName("input")[1].type = "submit";
	form.getElementsByTagName("input")[1].value = "Submit";
	div.appendChild(document.createElement("p"));
	return div;
}

function check_numeric(string) {
	for (let i = 0; i < string.length; ++i) {
		if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(string[i]) == false) return false;
	}
	return true;
}

function get_submission(submission_name, not_empty = true, is_numeric = true) {
	const div = document.body.appendChild(create_form("Please enter your "+submission_name+":"));
	const error = div.getElementsByTagName("p")[0];
	const form = div.getElementsByTagName("form")[0];
	return new Promise( (resolve) => {
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			if (form.getElementsByTagName("input")[0].value == "" && not_empty) {
				error.innerHTML = "You must enter a "+submission_name+".";
			} else if (!check_numeric(form.getElementsByTagName("input")[0].value) && is_numeric) {
				form.getElementsByTagName("input")[0].value = "";
				error.innerHTML = "Your "+submission_name+" should only contain numbers.";
			} else {
				document.body.removeChild(div);
				resolve(form.getElementsByTagName("input")[0].value);
			}
		})
	})
}

function wait_button(button_name) {
	const button = document.body.appendChild(document.createElement("button"));
	button.innerHTML = button_name;
	button.type = "button";
	return new Promise( (resolve) => {
		button.addEventListener("click", (event) => {
			document.body.removeChild(button);
			resolve();
		});
	});
}

// function to record audio from the user for the number of ms passed to it in the argument
// the return is a Promise object with properties for data (the format the audio is in), and blob (the media blob containing the audio)
function record_audio(time) {
	return navigator.mediaDevices.getUserMedia({video: false, audio: true})
	.then( (stream) => {
		// the reason for manually defining mimeType is twofold: we can set a preference order for types, and we can store the mimeTypes, as the MediaRecorder object does not seem to know otherwise
		let type = "";
		const types = ["audio/mp4", "audio/webm", "audio/ogg", "audio/mpeg", "audio/flac", "audio/wave", "audio/wav", "audio/xwav", "audio/x-pn-wav"];
		for (let i = 0; i < types.length; ++i) {
			if (MediaRecorder.isTypeSupported(types[i])) {
				type = types[i];
				return {stream: stream, recorder: new MediaRecorder(stream, {mimeType: types[i]}), type: type};
			}
		}
		type = "audio/unknown";
		return {stream: stream, recorder: new MediaRecorder(stream), type: type};
	})
	.then ( (media) => {
		return new Promise( (resolve) => {
			let data = [];
			media.recorder.addEventListener("dataavailable", (event) => {
				data.push(event.data);
			});
			media.recorder.addEventListener("stop", (event) => {
				media.stream.getTracks()[0].stop();
				resolve({blob: new Blob(data), type: media.type});
			});
			media.recorder.start();
			setTimeout( () => {media.recorder.stop();}, time );
		});
	});
}

// TODO: 
// --> Check the logic through the recorder section of the program and change if necessary
// --> Catch exceptions, and throw them where necessary
// --> Add things relating to the user's situation, e.g. we need to specify the recording format otherwise the browser will choose for us
//  \-> we may want to give the user the option to select an audio input, maybe only on desktop
//  \-> and more
// --> Consider where parts can be moved to functions, probably most of it
// --> Tidy, e.g. make it so that the MediaStream object is neatly either disabled or disposed of
// --> bear in mind we may want async, so that audio can be recorded + transcripts gotten at the same time.

const pavlovia = new Pavlovia();
let participant_id;
let the_data;
get_submission("Participant ID", true, true)
.then( (value) => {participant_id = value; return wait_button("RECORD");} )
.then( () => {return record_audio(3000);} )
/*.then( (data) => {
	const link = document.body.appendChild(document.createElement("a"));
	link.innerHTML = "download";
	link.download = "audio."+data.type.split("/")[1];
	link.href = URL.createObjectURL(data.blob);
})*/
.then( (data) => {the_data = data; return pavlovia.start()} )
.then( (data) => {return the_data.blob = the_data.blob.text();})
.then( () => {return pavlovia.uploadData(participant_id+"."+the_data.type.split("/")[1], the_data.blob);} )
.then( () => {return pavlovia.end();});
