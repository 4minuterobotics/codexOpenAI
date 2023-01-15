import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

//quereying element mannually since not using react.
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

//
let loadInterval;

//loading screen
function loader(element) {
	//reset loading screen
	element.textContent = "";
	//addd a dot to the loading sceen every 3 milliseconds. if it has 4 dots, reset to noen.
	loadInterval = setInterval(() => {
		element.textContent += ".";
		if (element.textContent === "....") {
			element.textContent = "";
		}
	}, 300);
}

//print answers out 1 letter at a time.
function typeText(element, text) {
	let index = 0;
	let interval = setInterval(() => {
		if (index < text.length) {
			//this means you're still typing
			element.innerHTML += text.charAt(index); // this will get the character under a specific index in the tex that the AI will return
			index++;
		} else {
			clearInterval(interval); //if we've reached the end of the text, clear the interval.
		}
	}, 20);
}

//generate a unique ID for every message to able to map over them
function generateUniqueId() {
	// in javascript, to generate a unique ID is by using the  current time and date.
	const timeStamp = Date.now();
	const randomNumber = Math.random();
	const hexadecimalString = randomNumber.toString(16);

	return `id-${timeStamp}-${hexadecimalString}`;
}

//create striped sections to show the chatbot and user's messages
function chatStripe(isAi, value, uniqueId) {
	//return a template string to allow spaces and enters
	//is ai speaking?, pass it the value of the message, pass it a unique ID
	return `
    <div class = "wrapper ${isAi && "ai"}">
    <div class = "chat">
    <div class = "profile">
    <img src = "${isAi ? bot : user}"
    alt = "${isAi ? "bot" : "user"}"
    />
    </div>
    <div class = "message" id = ${uniqueId}> ${value}</div>
    </div>
    </div>
    `;
}

//this is the trigger to get the AI generated response
const handleSubmit = async (e) => {
	//the default browser when submitting a form is to reload the browser. The nex t line will prevent that.
	e.preventDefault();
	//get the data typed into the form
	const data = new FormData(form); // form is a form element from within the html
	//generate a new user chat stripe
	chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
	//clear the text area input
	form.reset();

	//generate the bot's chatstripe
	const uniqueId = generateUniqueId();
	chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

	//as the user is typing, keep scrolling down to see the message and put it in view
	chatContainer.scrollTop = chatContainer.scrollHeight;

	//fetch the newly created div
	const messageDiv = document.getElementById(uniqueId);

	//turn on the loader
	loader(messageDiv);

	//this next section gets made after the sever side code is setup
	//fetch the data from the server -> get bots response
	const response = await fetch("https://codex-using-open-ai.onrender.com/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: data.get("prompt"),
		}),
	});

	//after we get the response, clear the interval
	clearInterval(loadInterval);
	messageDiv.innerHTML = "";
	if (response.ok) {
		const data = await response.json(); //this is giving usthe actual response coming from the back end
		const parsedData = data.bot.trim(); //parse the data

		console.log({ parsedData });

		//pass the data to our typeText function
		typeText(messageDiv, parsedData);
	} else {
		const err = await response.text();
		messageDiv.innerHTML = "Something went wrong";
		alert(err);
	}
};

//to see the changes made to the handle Submit, you have to call it
form.addEventListener("submit", handleSubmit); //happens when submit button is pressed
form.addEventListener("keyup", (e) => {
	if (e.keyCode === 13) {
		//happens when enter button is released. 13 is the enter key
		handleSubmit(e);
	}
});
