//this is where we will write serverside code to make calls to open ai

import express from "express";
import * as dotenv from "dotenv";
import cors from "cors"; // this will allow us to make cross orgin requests
import { Configuration, OpenAIApi } from "openai";

//to be able to use the dotenv variables..
dotenv.config();

//the configuration
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

//CREATE AN INSTANCE OF OPEN AI
const openai = new OpenAIApi(configuration);

//initialize express application
const app = express();
//set up some middlewares
app.use(cors()); //this will allow us to make cross origin requests and allow our server to be called from the fornt end
app.use(express.json()); //this will allow us to pass json from the front end to the back end

///the response from '/' get requests
app.get("/", async (req, res) => {
	//create a dummy root route
	res.status(200).send({
		message: "hello from codex",
	});
});

//this route allows us to have a body or payload
app.post("/", async (req, res) => {
	try {
		const prompt = req.body.prompt;
		//the most important thing. get a response from the openAPI. This model came from the exampls page on openAI's website
		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: `${prompt}`,
			temperature: 0, //how risky it is with its answers.
			max_tokens: 3000, //number of characters it can give in an answer
			top_p: 1,
			frequency_penalty: 0.5, //controls how often it repeats similar sentences
			presence_penalty: 0,
			//stop: ["\"\"\""], this isn't needed
		});

		//send the response to the front end
		res.status(200).send({
			bot: response.data.choices[0].text,
		});
	} catch (error) {
		res.status(500).send({ error });
	}
});

//make sure that the server always listens or requests
app.listen(5000, () => console.log("Server is running on port http://localhost:5000"));
