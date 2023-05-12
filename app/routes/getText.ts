import type {
    ActionArgs,
} from "@remix-run/node";

export enum GetText {
    'transcriptionJobFileUri' = 'transcriptionJobFileUri'
}

/**
 * Fetches the transcription job summary from AWS, requires no AWS creds as it's built right into URI
 */
export const action = async ({request}: ActionArgs): Promise<any> => {
    const formData = await request.formData();
    const transcriptionJobFileUri = formData.get(GetText.transcriptionJobFileUri)

    if (transcriptionJobFileUri) {
        return fetch(transcriptionJobFileUri as string)
    }

    throw new Error("Don't have file uri")
}
