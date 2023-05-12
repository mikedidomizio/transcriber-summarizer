import type {ActionArgs} from "@remix-run/node";

const { Configuration, OpenAIApi } = require("openai");

const {  OPENAI_API_KEY, OPEN_API_MAX_TOKENS} = process.env;

if (!OPENAI_API_KEY) {
    throw new Error('OPEN API key not set')
}

export enum SummarizeFormData {
    summarizedTextForOpenAI = 'summarizedTextForOpenAI'
}

export const action = async ({request}: ActionArgs) => {
    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const summarizedTextForOpenAI = formData.get(SummarizeFormData.summarizedTextForOpenAI)

    const openAiPrompt = `Summarize the following discussion:
        ${summarizedTextForOpenAI}
    `

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: openAiPrompt,
        temperature: 0,
        max_tokens: OPEN_API_MAX_TOKENS || 500,
    });

    return response.data.choices[0].text
}
