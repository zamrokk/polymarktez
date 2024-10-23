// jest.config.ts

import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest'


const jestConfig: JestConfigWithTsJest = {
  ...createDefaultEsmPreset({
    //FIXME Hacks to fix Jest/Jstz do not work tsconfig: "./tsconfig.test.json"
  }),
}

export default jestConfig