/*
Some standard functions for javascript written by Rory Phillips.
*/

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
    const input = form.getElementsByTagName("input")[0];
    return new Promise( (resolve) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (input.value == "" && not_empty) {
                error.innerHTML = "You must enter a "+submission_name+".";
            } else if (!check_numeric(input.value) && is_numeric) {
                input.value = "";
                error.innerHTML = "Your "+submission_name+" should only contain numbers.";
            } else {
                document.body.removeChild(div);
                resolve(input.value);
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

function index(array, index) {
	if (index > -1) {
		return array[index];
	}
	return array[array.length + index];
}

/*
get nested properties from within an object
INPUT REQUIREMENTS (PARTIAL CHECK):
-- object must be an object
-- property may be an array of strings which is the path to the property, or just a string for non-nested
-- object must contain property (or return will be undefined)
*/
function get_nested(object, property) {
	if (typeof object != "object")
		throw "in function get_nested(), cannot get a property from a non-object";
	if (typeof property == "string")
		return object[property];
	if (!Array.isArray(property))
		throw "in function get_nested(), the property was not given as an array or a string";
	let property_copy = [...property];
	let value = object[property_copy[0]];
	while (property_copy.length > 1) {
		if (typeof value != "object")
			throw "in function get_nested(), cannot get a property from a non-object";
		property_copy.splice(0, 1);
		value = value[property_copy[0]];
	}
	return value;
}

/*
merges two arrays of objects, which are ordered by a property, in order by that same property
INPUT REQUIREMENTS (DOES NOT CHECK):
-- both arrays must be arrays of objects (they may be of differing length)
-- property name must be a string and must be defined as a number in every object across both arrays
*/
function merge(array_one, array_two, property) {

	array_one.push({[property]: Number.POSITIVE_INFINITY}); // when one array is empty all others will be less than inf and added
	array_two.push({[property]: Number.POSITIVE_INFINITY});

	let merged = [];
	while(array_one.length > 1 || array_two.length > 1) { // continue until both arrays just have the infinity element left
		if (array_one[0][property] < array_two[0][property]) { // compare
			merged.push(array_one[0]); // add to our new array
			array_one.splice(0, 1); // remove from the old array
		} else if (array_one[0][property] > array_two[0][property]) {
			merged.push(array_two[0]);
			array_two.splice(0, 1);
		} else { // when they are equal
			merged.push(array_one[0], array_two[0]);
			array_one.splice(0, 1);
			array_two.splice(0, 1);
		}
	}
	return merged;
}

/*
sorts an array of objects by a property using a merge sort
INPUT REQUIREMENTS (PARTIAL CHECK):
-- array must be an array of objects
-- all objects must contain the property
-- the property must always contain a number
-- property name may be an array of strings, for nested objects, or just a string
*/ 
function sort(array, property) {
	if (!Array.isArray(array))
		throw "in function sort(), for merge sorting, the array passed was not an array!";

	let sorted = [];
	for (let i = 0; i < array.length; ++i) { // rather than merge sort with the array of objects, just use indexes for speed
		let value = get_nested(array[i], property);
		if (typeof array[i] != "object")
			throw "in function sort(), for merge sorting, the array passed does not contain only objects!"
		if (isNaN(value))
			throw "in function sort(), for merge sorting, the property to be sorted by is nan or does not exist (undefined)!";
		sorted.push( [{value: get_nested(array[i], property), index: i}] );
	}

    while (sorted.length > 1) { // continue merging subarrays until there is just one subarray left
        for (let i = 0; i < sorted.length - 1; i += 2) {
			sorted[i / 2] = merge(sorted[i], sorted[i + 1], "value");
        }
		if (sorted.length % 2 == 1) { // put any unpaired straggler into their spot
			sorted[Math.trunc(sorted.length / 2)] = sorted[sorted.length - 1];
		}
		sorted.splice( (sorted.length - Math.trunc(sorted.length / 2)) ); // remove all unmerged elements from the end
    }

	sorted = sorted[0] // make the array the one big subarray
	for (let i = 0; i < sorted.length; ++i) { // add the objects back into the array using the indexes
		sorted[i] = array[sorted[i].index];
	}

    return sorted;
}

const other_test = [ { thing: {num: 5}, other: "hello" } , { what: "the hell", thing: {num: 6, yeah: "what"} } , { thing: {num: 4} } ];
//const test_array = [{num: 1}, {num: 3}, {num: 2}];
const test_array = [{num: 1}, {num: 3}, {num: 0, stuff: "copy"}, {num: 2}, {num: 4}, {num: 0}, {num: 0.01}, {num: -5, thing: "hello"}, {gollygosh: "what", num: 3.2}, {num: -4.5}];
