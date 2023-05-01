import {
    json,
} from "@remix-run/node";
import type { PutObjectCommandOutput} from "@aws-sdk/client-s3";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
    throw new Error('AWS environment variables not set up correctly')
}

const client = new S3Client({
    region: 'us-east-1',
    credentials:{
        accessKeyId: AWS_ACCESS_KEY_ID as string,
        secretAccessKey: AWS_SECRET_ACCESS_KEY as string
    }
});

const fileName = "numberOfTimes.txt"

const fetchFile = async(): Promise<number | null> => {
    const command = new GetObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: fileName,
    });

    const response = await client.send(command);

    const numberOfTimesString = await response.Body?.transformToString("utf-8")

    if (numberOfTimesString && numberOfTimesString.length > 0) {
        return parseInt(numberOfTimesString, 10)
    }

    return null
}

const updateFile = async(num: number): Promise<PutObjectCommandOutput> => {
    const command = new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: fileName,
        Body: "" + num,
    });

    return client.send(command);
}

/**
 * Fetches the number of transcribes that have been performed
 */
export const loader = async (): Promise<any> => {
    try {
        const numberOfTimes = await fetchFile()
        if (typeof numberOfTimes === "number") {
            const newNumber = numberOfTimes + 1


            await updateFile(newNumber)

            return json(
                {
                    "numberOfTimes": newNumber,
                    status: 200,
                }
            );
        } else {
            await updateFile(0)
        }

        return json(
            {
                "numberOfTimes": 0,
                status: 200,
            }
        );
    } catch (err) {
        return json(
            {
                status: 520,
            }
        );
    }
}
