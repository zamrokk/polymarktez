// jest.config.ts

import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest'


console.log("**********************************");

const jestConfig: JestConfigWithTsJest = {
  ...createDefaultEsmPreset({
    //tsconfig: "./tsconfig.test.json"
  }),
}

export default jestConfig