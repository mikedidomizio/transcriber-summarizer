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

    const formData = await request.formData();
    const summarizedTextForOpenAI = formData.get('summarizedTextForOpenAI') as string

    const openAiPrompt = `Summarize the following discussion:
        ${summarizedTextForOpenAI}
    `


    console.log('prompt to send', openAiPrompt)

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: openAiPrompt,
        temperature: 0,
        // todo max tokens can't be this low :)
        max_tokens: 50,
    });

    console.log('response', response.data.choices[0].text)

    return response.data.choices[0].text
}
