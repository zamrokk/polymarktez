// jest.config.ts

import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest'


const jestConfig: JestConfigWithTsJest = {
  ...createDefaultEsmPreset({
  }),
}

export default jestConfig