# Testing

> Note 1 : Previously, Jest dependencies have been installed

> Note 2 : Tests can be written for the index.ts but the real code that will run is gonna be deployed with the chunk script and a proxy contract. To be sure that the solution works end to end and match with the CD pipeline flow, better to write tests for the ./chunk/index.ts. At the end, the same code from your index.ts will be uploaded and tested so there is no functional difference

Jest is the most popular Testing framework today and supported by Meta company

1. Create the test file

    ```bash
    touch ./chunk/index.test.ts
    ```

1. Edit the file with

    ```typescript
    
    ```

1. Add a script line to run tests on `package.json`

    ```json
    "test": "npm run chunk && npm run build_chunk  && jest  --runTestsByPath ./chunk/index.test.ts"
    ```

1. Create a configuration file to Jest so it can handle Typescript modules

    ```bash
    touch jest.config.ts
    ```
1. Edit the Jest cinfig with

    ```typescript
    // jest.config.ts

    import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest'


    const jestConfig: JestConfigWithTsJest = {
    ...createDefaultEsmPreset({
    }),
    }

    export default jestConfig
    ```

1. Run the test. 
    > Jest tests are using the Node runtime, so it does not mean that it works 100% also on the Jstz runtime too (for example if you use Node specific functions on your code)

    ```bash
    npm t
    ```

1. Check that all 11 tests passed, and let's review what has been done
    - `Kv` and `Ledger` globals variables have to be mocked. but we cannot use the mock system of Jest as it works on esm modules. Jstz typing file, where Kv and Ledger are defined, are not modules. So we just override the globals variables and inject a enough good code that replicates the right behavior
    - `init` endpoint is called first to initialize the Kv storage
    - `chunk` endpoint is called 3 times for the 3 file + 1 extra call with and empty payload to end the transfer
    - `ping` endpoint is called to just check that a basic call works
    - `bet` endpoint are called to fetch bet array and send bet instructions, then check results on the response
