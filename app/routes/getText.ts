import type {
    ActionArgs,
} from "@remix-run/node";

/**
 * Fetches the transcription job summary from AWS, requires no AWS creds as it's built right into URI
 */
export const action = async ({request}: ActionArgs): Promise<any> => {
    const formData = await request.formData();
    const transcriptionJobFileUri = formData.get('transcriptionJobFileUri') as string

    return fetch(transcriptionJobFileUri)
}
