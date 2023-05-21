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

export enum TranscribeFormData {
    's3Filename' = 's3Filename',
    'maxNumberOfSpeakers' = 'maxNumberOfSpeakers'
}

export const action = async ({request}: ActionArgs): Promise<StartTranscriptionJobCommandOutput | any> => {
    const config = {
        region: AWS_REGION,
        credentials:{
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
    }

    const formData = await request.formData();
    const s3Filename = formData.get(TranscribeFormData.s3Filename)
    const maxNumberOfSpeakers = formData.get(TranscribeFormData.maxNumberOfSpeakers) as string | null

    if (!s3Filename) {
        throw new Error('Did not get expected form data value')
    }

    const client = new TranscribeClient(config);
    const s3Location = `s3://${AWS_S3_BUCKET}/${s3Filename}`
    let checkedMaxNumberOfSpeakers = maxNumberOfSpeakers ? parseInt(maxNumberOfSpeakers, 10) : 10

    // the AWS Transcribe job does not seem to support less than 2 speakers `Member must have value greater than or equal to 2`
    if (checkedMaxNumberOfSpeakers < 2) {
       checkedMaxNumberOfSpeakers = 2
    }

    const input = {
        LanguageCode: 'en-US',
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
