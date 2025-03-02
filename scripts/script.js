
function random_letter(verbose=false){
	// Generates and returns a random letter (in int form) 
	
	// Generate random number between 65 and 90 (A-Z ascii)
	random_num = 65 + Math.floor(Math.random() * 100 % 26);
	
	if(verbose)
		console.log(random_num);
	
	return random_num;
}

////////////////////////////////////////////////////////////////////////////////

async function retrieve_words(p_current_letter, focus="", verbose=false){
	// Requests 4 random words from random-word-api.vercel.app, random word api:
	//		2 that begin with p_current_letter
	//		1 that begins with 1 letter previous to p_current_letter
	//		1 that begins with 1 letter after p_current_letter
	
	return_array = new Array(4);
	requests = new Array(3);
	let prev_letter = p_current_letter;
	let next_letter = p_current_letter;


	// Initialize prev_letter and next_letter variables, circling value if either A or Z
	if(p_current_letter == 65)
		prev_letter = 90;
	else 
		prev_letter--;
	
	if(p_current_letter == 90)
		next_letter = 65;
	else
		next_letter++;
	
	// Retrieve 2 random words that start with p_current_letter
	let number_words = focus==""? 2 : 1;
	requests[0] = fetch("https://random-word-api.vercel.app/api?words=" + number_words.toString() + "&letter=" + String.fromCharCode(p_current_letter+32))
		.then(response => response.json());
	
	// Retrieve 1 random word that starts with prev_letter
	requests[1] = fetch("https://random-word-api.vercel.app/api?words=1&letter=" + String.fromCharCode(prev_letter+32))
		.then(response => response.json());
		
	// Retrieve 1 random word that starts with next_letter
	requests[2] = fetch("https://random-word-api.vercel.app/api?words=1&letter=" + String.fromCharCode(next_letter+32))
		.then(response => response.json());
	
	requests = await Promise.allSettled(requests)
		.then(response => response.map(object => object.value));


	// Transfer words from the array of requests into return_array
	if(focus == "")
		[return_array[0], return_array[1]] = requests[0];
	else{
		return_array[0] = focus;
		[return_array[1]] = requests[0];
	}
		
	for(let x=1; x<requests.length;x++){
		[return_array[x+1]] = requests[x];
	}

	if(verbose)
		console.log(return_array);
	
	return return_array;
	
}

///////////////////////////////////////////////////////////////////////////////

async function retrieve_definitions(p_word_array, verbose=false){
	// Retrieves definition for p_word (String) by calling 
	// Merriam-Webster's Collegiate® Dictionary With Audio API
	
	let return_array = new Array(4);
	let requests = new Array(4);
	
	// Populate array of requests with Promises for word definitions
	for(let x=0; x<requests.length; x++)
		requests[x] = fetch("https://www.dictionaryapi.com/api/v3/references/collegiate/json/" + p_word_array[x] + "?key=acf893d6-264f-44dd-9952-9b25a040957e")
			.then(response => response.json());
	
	// Once all requests are fulfilled, store arrays of definitions in return_array
	return_array = await Promise.allSettled(requests)
		.then(response => response.map(object => object.value));
	
	if(verbose)
		console.log(return_array);
	
	return return_array;
	
}

/////////////////////////////////////////////////////////////////////////////////

window.onload = async function(){
	
	let current_letter = 65;
	
	// Check if main word is not already declared 
	// (would happen if "Previous Definition" or similar button is pressed)
	url_parameters = new URLSearchParams(window.location.search);
	if(url_parameters.has('word')){
		current_letter = url_parameters.get('word').charCodeAt(0);
		if(current_letter >= 97)
			current_letter -= 32;
	}else{
		current_letter = random_letter();
	}
		
	// Update title element with the current letter
	document.getElementsByTagName('title')[0].innerHTML = String.fromCharCode(current_letter) + " " + document.getElementsByTagName('title')[0].innerHTML;
	
	// Update "Random x Definition" section element with current letter
	document.getElementById('random').childNodes[1].innerHTML = "<h2>Random " + String.fromCharCode(current_letter) + " Definition</h2>"

	// Populate words array with random words
	let words = new Array(4);
	words = await retrieve_words(current_letter, focus=url_parameters.has('word')? url_parameters.get('word') : "");
	
	// Populate definitions array with definitions for the words in words array
	let definitions = new Array(4);
	definitions = await retrieve_definitions(words);
	
	// Replace loading placeholders with the words and their definitions 
	let main_def = words[0] + " - " + definitions[0][0].shortdef[0] + '.';
	document.getElementById('definition').childNodes[1].innerHTML = main_def;
	document.getElementById('definition').childNodes[3].href = "https://www.merriam-webster.com/dictionary/" + words[0];
	
	let prev_def = words[2] + " - " + definitions[2][0].shortdef[0] + '.';
	document.getElementById('prev').childNodes[3].innerHTML = prev_def;
	document.getElementById('prev').childNodes[1].href = "?word=" + words[2];
	
	let random_def = words[1] + " - " + definitions[1][0].shortdef[0] + '.';
	document.getElementById('random').childNodes[3].innerHTML = random_def;
	document.getElementById('random').childNodes[1].href = "?word=" + words[1];
	
	let next_def = words[3] + " - " + definitions[3][0].shortdef[0] + '.';
	document.getElementById('next').childNodes[3].innerHTML = next_def;
	document.getElementById('next').childNodes[1].href = "?word=" + words[3];

	
};

// https://random-word-api.vercel.app/api?words=2&letter=m

// acf893d6-264f-44dd-9952-9b25a040957e   dictionary
// https://dictionaryapi.com/api/v3/references/collegiate/json/test?key=acf893d6-264f-44dd-9952-9b25a040957e
