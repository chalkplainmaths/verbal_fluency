//const pavlovia = new Pavlovia();

function create_form(message) {
	const form = document.createElement("form");
	form.appendChild(document.createElement("label"));
	form.appendChild(document.createElement("input"));
	form.appendChild(document.createElement("input"));
	form.getElementsByTagName("label")[0].innerHTML = message;
	form.getElementsByTagName("input")[1].type = "submit";
	form.getElementsByTagName("input")[1].value = "Submit";
	return form;
}

function check_numeric(string) {
	for (i = 0; i < string.length; ++i) {
		if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(string[i]) == false) return false;
	}
	return true;
}

function validate_form(form, result_name, not_empty = true, numeric = false) {
	const value = form.getElementsByTagName("input")[0].value;
	if (value == "" && not_empty == true) {
		alert("You must enter a "+result_name+".");
	} else if (!check_numeric(value) && numeric == true) {
		alert("Your "+result_name+" should only contain numbers.");
		form.getElementsByTagName("input")[0].value = "";
	} else {
		console.log("form input: "+value);
		document.body.removeChild(form);
		return true;
	}
	return false;
}

function form_listener(form, resolve) {
	form.addEventListener("submit",
		function(event) {
			event.preventDefault();
			if(validate_form(form, "Participant ID", true, true))
				resolve(form.getElementsByTagName("input")[0].value); // for more complex forms the arguments pass to the resolve func could be generalised
		}
	)
}

function get_id() {
	const my_form = document.body.appendChild(create_form("Please enter your Participant ID:"));
	return new Promise( (resolve) => {form_listener(my_form, resolve);} );
}

function change_state(is_recording, my_indicator) {
	console.log("click");
	if(!is_recording)
		my_indicator.innerHTML = "RECORDING";
	else
		my_indicator.innerHTML = "NOT RECORDING";
	return !is_recording;
}

function add_record() {
	let is_recording = false;
	const my_indicator = document.body.appendChild(document.createElement("p"));
	my_indicator.innerHTML = "NOT RECORDING";
	const my_button = document.body.appendChild(document.createElement("button"));
	my_button.type = "button";
	my_button.innerHTML = "RECORD";
	my_button.addEventListener("click", () => { is_recording = change_state(is_recording, my_indicator);} );
}

const participant_id = get_id().then( (value) => {return value;} );
participant_id.then( () => {add_record();} );
