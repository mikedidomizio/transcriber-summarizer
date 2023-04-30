import {AwsTranscribeJobJson} from "~/lib/aws-transcribe.types";

export const separateBySpeaker = (
    json: AwsTranscribeJobJson,
) => {
    return separateBySpeakerParagraph(json)
}

const separateBySpeakerParagraph = (json: AwsTranscribeJobJson): string => {
    let previousSpeaker: string = null

    return json.results.items.reduce((acc, cur) => {
        const isNewSpeaker = cur.speaker_label !== previousSpeaker

        if (isNewSpeaker) {
            if (acc !== '') {
                acc += '"\n\n'
            }

            acc += `${cur.speaker_label} said, "`
            previousSpeaker = cur.speaker_label
        }

        const word = cur.alternatives[0].content

        if (word === '.') {
            acc += `${cur.alternatives[0].content}`
        } else {
            acc += ` ${cur.alternatives[0].content}`
        }

        return acc
    }, '')
}
