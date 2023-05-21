import {
    json,
} from "@remix-run/node";
import type { PutObjectCommandOutput} from "@aws-sdk/client-s3";
import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

const { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_TAGGING } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_REGION || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET || !AWS_TAGGING) {
    throw new Error('AWS environment variables not set up correctly')
}

const client = new S3Client({
    region: AWS_REGION,
    credentials:{
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
});

const fileName = "numberOfTimes.txt"

const fetchFile = async(): Promise<number | null> => {
    const command = new GetObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: fileName,
    });

    const response = await client.send(command);
    client.destroy()

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
        Tagging: AWS_TAGGING
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
