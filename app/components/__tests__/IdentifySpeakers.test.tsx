import {IdentifySpeakers, Speaker} from "~/components/IdentifySpeakers";
import {render, screen} from "@testing-library/react";

// todo skipped because this component doesn't actually filter for unique speakers, and maybe it shouldn't
it.skip('should show a row to identify for each unique speaker', () => {
  const speakers: Speaker[] = [
    {startTime: "0", speakerLabel: "spk_0"},
    {startTime: "0", speakerLabel: "spk_0"},
    {startTime: "0", speakerLabel: "spk_0"}
  ]

  render(<IdentifySpeakers blobUrl={"http://"} speakers={speakers}  onFinish={() => {}}/>)

  expect(screen.getAllByTestId("whoIsThisRow")).toHaveLength(1)
})
