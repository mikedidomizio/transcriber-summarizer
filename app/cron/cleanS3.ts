import {DeleteObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import is from "@sindresorhus/is";
import date = is.date;

require("dotenv").config();

const { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_TAGGING } = process.env;

if (!AWS_ACCESS_KEY_ID || !AWS_REGION || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET || !AWS_TAGGING) {
  throw new Error('AWS environment variables not set up correctly')
}

const diffInDays = (date: number, otherDate: number) => {
  const difference = date - otherDate
  return Math.ceil(difference / (1000 * 3600 * 24));
}

const cleanS3 = async (olderThanDays: number) => {
  console.log('starting clean: ', olderThanDays)
  const currentTime = new Date().getTime()

  const client = new S3Client({
    region: AWS_REGION,
    credentials:{
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });

  const listObjectsCommand = new ListObjectsCommand({
    Bucket: AWS_S3_BUCKET,
  })

  const response = await client.send(listObjectsCommand)

  console.log('Number of files', response.Contents?.length || 0)

  if (response.Contents) {
    for(let file of response.Contents) {
      const fileLastModifiedTime = (file.LastModified as any).getTime()

      console.log(fileLastModifiedTime)

      const d = diffInDays(currentTime, fileLastModifiedTime)

      if (d > olderThanDays) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: file.Key
        })

        await client.send(deleteCommand)
      }
    }
  }

  client.destroy()
}


(async() => {
  await cleanS3(3)
})()
