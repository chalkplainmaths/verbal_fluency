/*

TODO _handle_result needs to sort through and get timestamps for words, continue with this

*/

class Fluency {

transcript = [];
interim_results = [];
audio_data = [];
start_time;
mime_types = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/flac", "audio/wave", "audio/wav", "audio/xwav", "audio/x-pn-wav", "audio/aac", "audio/opus", "audio/3gpp"];

constructor(type) {

	this.test_type = type;

	try {
		this.recognition = new webkitSpeechRecognition();
	} catch (error) {
		this.recognition = new SpeechRecognition();
	}
	this.recognition.maxAlternatives = 99; // this is set to an arbitrarily high number as we just want as many as possible
	this.recognition.interimResults = true;
	this.recognition.continuous = false;
	this.recognition.lang = "en-GB";

}

/*init() {
	try {
		this.recognition = new webkitSpeechRecognition();
	} catch(error) {
		this.recognition = new SpeechRecognition();
	}
	this.recognition.maxAlternatives = 99; // this is set to an arbitrarily high number as we just want as many as possible
	this.recognition.interimResults = true;
	this.recognition.continuous = false;
	this.recognition.lang = "en-GB";
	this.transcript = [];
	this.interim_results = [];
	this.audio_data = [];
	this.start_time;
	this.mime_types = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/flac", "audio/wave", "audio/wav", "audio/xwav", "audio/x-pn-wav", "audio/aac", "audio/opus", "audio/3gpp"];
	this.event_log = [];
}*/

get_mime_type() {
    for (let i = 0; i < this.mime_types.length; ++i) {
        if (MediaRecorder.isTypeSupported(this.mime_types[i]))
            return this.mime_types[i];
    }
    return "audio/unknown";
}

start_audio() {
	return navigator.mediaDevices.getUserMedia({video: false, audio: true})
	.then( (value) => {
		this.stream = value;
		this.mime_type = this.get_mime_type();
		if (this.mime_type != "audio/unknown")
			this.recorder = new MediaRecorder(this.stream, {mimeType: this.mime_type});
		else
			this.recorder = new MediaRecorder(this.stream);
		this.recorder.addEventListener( "dataavailable", (event) => {
			this.audio_data.push(event.data);
		});
		this.recorder.start();
		console.log("audio recording started");
		return;
	});
}

stop_audio() {
	return new Promise( (resolve) => {
		this.recorder.addEventListener( "stop", (event) => {
			this.stream.getTracks()[0].stop();
			this.audio_blob = new Blob(this.audio_data);
			resolve();
		}, {once: true});
		this.recorder.stop();
	});
}

new_word_condition(word) {

	return fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word, {method: "GET"}).then( (response) => {
        if (!response.ok)
			return false;
		return response.json();
    }).then( (json) => {
		if (!json)
			return false;
		const meanings = json[0].meanings;
	});

}

word_condition(word) {
	if (word[0] == "P")
		return true;
	return false;
}

handle_result(event, force_final = false) {

	//this.event_log.push(JSON.stringify(event.results[0]));

	console.log(event);
	this.prev_event = event;

	if (event.results[0].isFinal || force_final) {

		console.log("FINAL RESULT EVENT:", event);

		// select the final result we will use
		// prioritises number of satisfactory words in the first case, then confidence
		let result = {num: 0, confidence: 0, arr: []}; // num is the number of words that meet the criteria
		for (let i = 0; i < event.results[0].length; ++i) {
			let num = 0; // num is the num of words that meet the criteria
			const arr = event.results[0][i].transcript.toUpperCase().split(" "); // the array of words
			for (let a = 0; a < arr.length; ++a) {
				if (this.word_condition(arr[a]))
					num += 1; // add one for every words that satisfies the criteria
			}
			if (result.num < num || (result.num == num && result.confidence < event.results[0][i].confidence))
				result = {num: num, confidence: event.results[0][i].confidence, arr: arr};
		}
		result = result.arr;

		console.log(result);
		
		// we now want to find the timestamp for each word, we do this using the interim results
		//const frame_one = result.slice(0, result.length - 2);
		//const frame_two = result.slice(0, result.length - 1);

		/*
		we want to find the time when each word was said, we do this using the interim results
		this interim results are stored as lists of words, like the final result
		however, sometime a shorter section of a words will be recorded first
		e.g. pledge becomes pleasure a half second later
		the actual time the word was said was on pledge though
		so we actually find the interim result when the list was the final result minus the word we're looking for (and all those after)
		and take the timestamp of the interim result immediately after that
		*/

		// make an array to hold the timestamps, indexes will correspond to words in result array
		const times = [this.interim_results[0].time];

		let prev_index = 0;

		// go through all the words in result
		for (let i = 1; i < result.length; ++i) {

			console.log("NOW LOOKING FOR TIMESTAMP FOR",
				result[i],
				"BY LOOKING FOR",
				result.slice(0, i));

			let index = -1;
			let found = false;

			for (let a = prev_index; a < this.interim_results.length; ++a) {

				// if we haven't found result[i] minus the last word yet, do this
				if (!found) {

					//if (sort(this.interim_results[a].arr, "length")[0].length > i) {
					/*if (get_min_max(this.interim_results[a].arr, "length").min > i) {
						index = a - 1;
						break;
					}*/

					console.log("IN", this.interim_results[a]);

					for (let b = 0; b < this.interim_results[a].arr.length; ++b) {
						if ( JSON.stringify(this.interim_results[a].arr[b].slice(0, i)) == JSON.stringify(result.slice(0, i)) ) {
							found = true;
							a = a - 1;
							console.log("FOUND IT\nNOW LOOKING FOR WHERE THE TRANSCRIPT IS LONGER");
							break;
						}
					}

				// this part is if we are now looking for when the word whose timestamp we want (or part of it) gets added
				} else {

					console.log("IN", this.interim_results[a]);

					// get the greatest word length from the transcripts returned in the current interim result (interim_results[a])
					/*let greatest_length = 0;
					for (let b = 0; b < this.interim_results[a].arr.length; ++b) {
						if (this.interim_results[a].arr[b].length > greatest_length)
							greatest_length = this.interim_results[a].arr[b].length;
					}*/

					// if that length is the same as the result we're looking for (result[i]), we have found the result whose timestamp we want
					/*if (i + 1 <= greatest_length) {
						index = a;
						console.log("FOUND IT (2)");
						break;
					}*/

					if (i + 1 <= get_min_max(this.interim_results[a].arr, "length").max) {
						index = a;
                        console.log("FOUND IT (2)");
                        break;
                    }

				}

			}

			// TODO  could we make it so it starts searching at the index of the previous one, as we never want a negative interval anyway?
			// TODO also inconsistency in approach for finding min/max properties, maybe write seperate functions instead of trying to use sort() unnecessarily
			// TODO could stop using new Array().concat and just use .concat on the array instead?

			if (index != -1) {
				times.push(this.interim_results[index].time);
				prev_index = index;
			} else if (i + 1 == result.length) {
				times.push(event.timeStamp - this.start_time);
			} else {
				times.push(NaN);
				//times.push(times[times.length - 1]);
				prev_index = 0;
			}
		}

		for (let i = 0; i < result.length; ++i) {
			result[i] = {word: result[i], time: Math.round(times[i])};
		}

		console.log(result);
		//this.transcript = new Array().concat(this.transcript, result);
		this.transcript = this.transcript.concat(result);

		console.log("INTERIM RESULT LIST: (AS OF FINAL RESULT)", this.interim_results);
		this.interim_results = [];

		/*for (let i = 0; i < this.interim_transcript.length; ++i) {
            this.transcript.push(this.interim_transcript[i]);
        }
        this.interim_transcript = [];*/
    } else {

		const arr = [];

		for (let i = 0; i < event.results[0].length; ++i) {
			arr.push(event.results[0][i].transcript.toUpperCase().split(" "));
		}

		this.interim_results.push({arr: arr, time: event.timeStamp - this.start_time});
		console.log(this.interim_results[this.interim_results.length - 1]);

	}
}

// get speech said verbally by the user, time to be given in ms, indicator will show when recognition is occuring, audio is whether or not we should record audio with it
get_speech(time, audio = false, recog_indicator = {innerHTML: ""}, audio_indicator = {innerHTML: ""}) {

	// add the event listeners
	this.recognition.addEventListener( "result", (event) => {this.handle_result(event);} );
	this.recognition.addEventListener( "end", this.recognition.start );

	// return is a promise which resolves when the listening (for speech) is finished
	return (() => {
		if (audio)
			return this.start_audio();
		else
			return Promise.resolve();
	})().then( () => {return new Promise( (resolve) => {

		this.start_time = new Event("").timeStamp;
		audio_indicator.innerHTML = "RECORDING AUDIO NOW";

		// the first promise resolves when recognition has actually started (when user has given permission)
		this.recognition.addEventListener( "start", (event) => {
			this.recog_start_time = event.timeStamp;
			resolve();
		}, {once: true} ); // we set the once option to true to specify the listener should be removed after one use

		// actually start recognition
		this.recognition.start();

	})}).then( () => {return new Promise( (resolve) => {

		recog_indicator.innerHTML = "LISTENING FOR SPEECH NOW";

		// this function will execute after the specified period of time
		setTimeout( () => {

			// remove the event listeners
			this.recognition.removeEventListener( "result", (event) => {this.handle_result(event);} );
			this.recognition.removeEventListener( "end", this.recognition.start );

			// add an event listener to resolve the promise when recognition has actually stopped
			this.recognition.addEventListener("end", () => {
				resolve();
			}, {once: true});

			// stop recognition
			this.recognition.stop();

		}, time);

	})}).then( () => {

		recog_indicator.innerHTML = "";

		if (!this.prev_event.results[0].isFinal) { // if the last event was not a final result, treat the last interim result as one
			this.handle_result(this.prev_event, true);
		}

		if (audio)
			return this.stop_audio();
		else
			return Promise.resolve();

	}).then( () => {

		audio_indicator.innerHTML = "";
		return;

	});

}

gen_csv() {
	let csv = "Word,Time,Interval\n";
	for (let i = 0; i < this.transcript.length; ++i) {
        csv += this.transcript[i].word
            + ","
            + this.transcript[i].time
			+ ",";
		if (i != 0)
			csv += (this.transcript[i].time - this.transcript[i-1].time);
		csv += "\n";
    }
	return csv;
}

}
