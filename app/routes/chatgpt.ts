import type {ActionArgs} from "@remix-run/node";

const { Configuration, OpenAIApi } = require("openai");

export type ChatGPTAgent = "user" | "system";

// Define ChatGPTMessage interface
interface ChatGPTMessage {
    role: ChatGPTAgent;
    content: string;
}

// Define promptPayload interface
interface promptPayload {
    model: string;
    messages: ChatGPTMessage[];
    temperature: number;
    max_tokens: number;
}


const {  OPENAI_API_KEY} = process.env;

if (!OPENAI_API_KEY) {
    throw new Error('OPEN API key not set')
}

export const action = async ({request}: ActionArgs) => {
    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Say this is a test",
        temperature: 0,
        max_tokens: 7,
    });

    console.log(response)

    return null
}
