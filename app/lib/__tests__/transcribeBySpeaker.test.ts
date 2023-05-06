import {separateBySpeaker} from "~/lib/transcribeBySpeaker";

import json from './mock'

it('should format it in a nice format', () => {
  const response = separateBySpeaker(json)

  expect(response).toContain('spk_0 said, "This is a test to just make sure everything is working as expected ."')
})
