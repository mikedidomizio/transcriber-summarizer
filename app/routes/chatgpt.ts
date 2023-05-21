import type {ActionArgs} from "@remix-run/node";
import {SummaryStyle} from "~/components/TranscribeOptions";

const { Configuration, OpenAIApi } = require("openai");

const {  OPENAI_API_KEY, OPEN_API_MAX_TOKENS} = process.env;

if (!OPENAI_API_KEY) {
    throw new Error('OPEN API key not set')
}

export enum SummarizeFormData {
    bulletPoints = 'bulletPoints',
    summarizedTextForOpenAI = 'summarizedTextForOpenAI',
    summaryStyle = 'summaryStyle'
}

const replaceWithBr = (str: string) => str.replace(/\n/g, "<br />")

export const action = async ({request}: ActionArgs) => {
    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
    });

    const formData = await request.formData();
    const bulletPoints = formData.get(SummarizeFormData.bulletPoints)
    const summaryStyle = formData.get(SummarizeFormData.summaryStyle) as SummaryStyle | null

    if (summaryStyle !== "BulletPoints" && summaryStyle !== "Summary") {
        throw new Error("Did not receive proper summary style")
    }

    const summarizedTextForOpenAI = formData.get(SummarizeFormData.summarizedTextForOpenAI)

    const prompts: Record<SummaryStyle, string> = {
        "BulletPoints": `Summarize the following in ${bulletPoints} bullet points, in order it was discussed: `,
        "Summary": 'Summarize the following discussion',
    }

    const openAiPrompt = `${prompts[summaryStyle]}
        ${summarizedTextForOpenAI}
    `

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: openAiPrompt,
        temperature: 0,
        max_tokens: OPEN_API_MAX_TOKENS || 500,
    });

    return replaceWithBr(response.data.choices[0].text)
}
