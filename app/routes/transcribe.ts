import type {
    StartTranscriptionJobCommandOutput
} from "@aws-sdk/client-transcribe";
import {
    TranscribeClient,
    StartTranscriptionJobCommand
} from "@aws-sdk/client-transcribe";
import type {ActionArgs} from "@remix-run/node";

const { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_REGION || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS environment variables not set up correctly')
}

export const action = async ({request}: ActionArgs): Promise<StartTranscriptionJobCommandOutput | any> => {
    const config = {
        region: AWS_REGION,
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string
        }
    }

    const formData = await request.formData();
    const s3Filename = formData.get('s3Filename')
    const maxNumberOfSpeakers = formData.get('maxNumberOfSpeakers') as string | null

    if (!s3Filename) {
        throw new Error('Did not get expected form data value')
    }

    const client = new TranscribeClient(config);
    const s3Location = `s3://${AWS_S3_BUCKET}/${s3Filename}`
    const checkedMaxNumberOfSpeakers = maxNumberOfSpeakers ? parseInt(maxNumberOfSpeakers, 10) : 10

    const input = {
        LanguageCode: 'en-US',
        // todo it should be more unique to avoid conflicts
        TranscriptionJobName: `test-transcriber-summarizer-job-${s3Filename}`,
        Media: {
            MediaFileUri: s3Location,
        },
        Settings: {
            MaxSpeakerLabels: checkedMaxNumberOfSpeakers,
            ShowSpeakerLabels: true,
        }
    }

    const command = new StartTranscriptionJobCommand(input);
    return client.send(command);
}
