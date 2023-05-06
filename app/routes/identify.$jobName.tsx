import {useParams} from "react-router";
import {IdentifySpeakers} from "~/components/IdentifySpeakers";
import {useTranscribeJob} from "~/hooks/useTranscribeJob";

/**
 * This route is more for testing purposes.  Pass the AWS Transcribe job name as a parameter
 * /identify/${AWSTranscribeJob}
 * @constructor
 */
export default function JobName() {
  const { jobName } = useParams()

  if (!jobName) {
    throw new Error('Could not get param jobName')
  }

  const { speakers } = useTranscribeJob(jobName)

  if (speakers !== null) {
    return <IdentifySpeakers speakers={speakers} onFinish={() => {}} />
  }

  return <div>{jobName}</div>
}
