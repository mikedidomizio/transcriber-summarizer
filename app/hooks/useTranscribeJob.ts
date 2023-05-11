import {useCallback, useEffect, useState} from "react";
import type {Speaker} from "~/components/IdentifySpeakers";
import type {Segment} from "~/lib/aws-transcribe.types";
import type {GetTranscriptionJobResponse} from "@aws-sdk/client-transcribe";
import {PollTranscribeJobFormData} from "~/routes/pollTranscribeJob";
import {GetText} from "~/routes/getText";

const getUniqueSpeakers = (speakers: Speaker[]): Speaker[] => {
  return speakers.filter((obj, index, arr) => {
    return arr.map(mapObj => mapObj.speakerLabel).indexOf(obj.speakerLabel) === index;
  })
}

export const useTranscribeJob = (jobName: string | undefined) => {
  const [isPolling, setIsPolling] = useState(false)
  const[speakers, setSpeakers] = useState<Speaker[] | null>(null)
  const [numberOfTimesPolled, setNumberOfTimesPolled] = useState(0)
  const [getAWSResponse, setGetAWSResponse] = useState(null)

  useEffect(() => {
    if (jobName) {
      setIsPolling(true)
      setSpeakers(null)
      setNumberOfTimesPolled(0)
    }
  }, [jobName])

  const getText = useCallback(async(transcriptionJobFileUri: string) => {
    const formDataGetText = new FormData()
    formDataGetText.set(GetText.transcriptionJobFileUri, transcriptionJobFileUri)

    const res = await fetch('/getText', {
      method: 'POST',
      body: formDataGetText
    });

    const json = await res.json()
    setGetAWSResponse(json)

    const peopleToIdentify: Speaker[] = json.results.speaker_labels.segments.map((i: Segment) => {
      return {
        speakerLabel: i.speaker_label,
        startTime: i.start_time
      }
    })

    // filters for unique speakers, as well as returns the first instance of them speaking
    const filteredPeopleToIdentify = getUniqueSpeakers(peopleToIdentify)

    setIsPolling(false)
    setSpeakers(filteredPeopleToIdentify)
  }, [])

  const pollTranscribeJob = useCallback(async(jobName: string) => {
    const formDataPollingTranscribeJob = new FormData()
    formDataPollingTranscribeJob.set(PollTranscribeJobFormData.jobName, jobName)

    const pollTranscribePollRes = await fetch('/pollTranscribeJob', {
      method: 'POST',
      body: formDataPollingTranscribeJob
    });

    const pollTranscribePollResponse: GetTranscriptionJobResponse = await pollTranscribePollRes.json()

    if (pollTranscribePollResponse.TranscriptionJob?.TranscriptionJobStatus === "COMPLETED") {
      if (pollTranscribePollResponse.TranscriptionJob.Transcript?.TranscriptFileUri) {
        await getText(pollTranscribePollResponse.TranscriptionJob.Transcript?.TranscriptFileUri)
      }
    }

    setNumberOfTimesPolled((num) => num + 1)
  }, [getText])

  useEffect(() => {
    if (isPolling && jobName) {
      let interval  = setInterval(async() => {
        await pollTranscribeJob(jobName)
      }, 3000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [jobName, isPolling, pollTranscribeJob])

  return { speakers, numberOfTimesPolled, getAWSResponse }
}
