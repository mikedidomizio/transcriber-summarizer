import type {
    ActionArgs,
} from "@remix-run/node";
import type { GetTranscriptionJobCommandOutput} from "@aws-sdk/client-transcribe";
import {
    GetTranscriptionJobCommand,
    TranscribeClient
} from "@aws-sdk/client-transcribe";

const { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_REGION || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS environment variables not set up correctly')
}

export enum PollTranscribeJobFormData {
    'jobName' = 'jobName'
}

export const action = async ({request}: ActionArgs): Promise<GetTranscriptionJobCommandOutput> => {
    const config = {
        region: AWS_REGION,
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
    }

    const formData = await request.formData();
    const jobName = formData.get(PollTranscribeJobFormData.jobName)

    if (jobName) {
        const client = new TranscribeClient(config);
        const input = {
            TranscriptionJobName: jobName as string,
        };

        const command = new GetTranscriptionJobCommand(input)
        return client.send(command)
    }

    throw new Error("Dont have right form data")
}
