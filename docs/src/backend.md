# Backend development

1. Create a blank Typescript project 

    Fill information while running (your default main entrypoint has to be `index.ts` and not `index.js`)

    ```bash
    npm init
    ```

1. Install Typescript and tsx as dev dependency, esbuild for building, jest and node for running tests locally

    ```bash
    npm i -D typescript tsx  @types/jest @types/node esbuild jest ts-jest
    ```
1. Create a tsconfig file
  
    ```bash
    touch tsconfig.json
    ```

    And paste this inside to add typings for jstz (and jest for testing later)

    ```json
    {
    "compilerOptions": {
        "lib": [
        "esnext"
        ],
        "module": "esnext",
        "target": "esnext",
        "strict": true,
        "moduleResolution": "node",
        "types": [
        "@jstz-dev/types",
        "jest",
        ],
        "resolveJsonModule": true,
        "esModuleInterop": true,
    },
    "exclude": [
        "node_modules"
    ],
    }
    ```
1. Update the script section on `package.json` to build your app

    ```json
    "scripts": {
      "build": "esbuild index.ts --bundle --format=esm --target=esnext --minify --outfile=dist/index.js"
    }
    ```
1. Create a default index.ts file

    ```bash
    touch index.ts
    ```

    and edit it with

    ```typescript
    const handler = async (request: Request): Promise<Response> => {
      return new Response();
    };
  
    export default handler;
    ```

1. Compile

    ```bash
    npm run build
    ```
//TODO start to code the handler