# Use chunk script to deploy large code

If you have a generated Javascript code > 3915 bytes, your code will not deploy correctly on the Jstz sandbox. In order to fix this, there is a workaround. 

You will need to cut your code in pieces and send it to a small proxy contract that will recompose the full code from the storage and evaluate it when a request is received

1. Create a new `index.ts` file

    ```bash
    mkdir chunk
    touch chunk/index.ts
    ```

1. Edit the file with

    ```typescript
    import { Bet, BET_RESULT, KEYS } from "../index.types";

    export enum BOOT_MODE {
    CHUNKING = "CHUNKING",
    BOOTED = "BOOTED",
    }

    const init = async (request: Request) => {
    if (Kv.has(KEYS.RESULT)) {
        const error = "State already initialized";
        console.error(error);
        return new Response(error, { status: 500 });
    } else {
        const referer = request.headers.get("Referer");
        console.log("Initializing smart function state from admin " + referer);
        Kv.set(KEYS.FEES, 0.1);
        Kv.set(KEYS.BETMAP, new Map<string, Bet>());
        Kv.set(KEYS.RESULT, BET_RESULT.PENDING);
        Kv.set(KEYS.ADMIN, referer);
        Kv.set(KEYS.BOOT_MODE, BOOT_MODE.CHUNKING);
        return new Response();
    }
    };

    const run = async (request: Request): Promise<Response> => {
    console.log("Calling run with request " + request);
    const code: string = await Kv.get(KEYS.CODE)!;
    const module = eval(code);
    console.log("module", module);
    const handler = module.default;
    return await handler(request);
    };

    const chunker = async (request: Request) => {
    const url = new URL(request.url);

    if (url.pathname !== "/chunk" && request.method !== "POST") {
        return new Response("Not found", { status: 404 });
    }

    // assert POST /chunk
    const body = await request.text();

    if (!body || body.trim() === "") {
        console.log("last call to end the uploads");
        Kv.set(KEYS.BOOT_MODE, BOOT_MODE.BOOTED);

        try {
        Kv.set(KEYS.CODE, atob(Kv.get(KEYS.CODE) || "")); //decode base64
        } catch (e) {
        console.warn("atob failed, trying with Buffer ...", e);
        try {
            Kv.set(
            KEYS.CODE,
            Buffer.from(Kv.get<string>(KEYS.CODE)!, "base64url").toString()
            ); //decode base64
        } catch (error) {
            console.log("Impossible to decode64url even with Buffer", error);
            throw e;
        }
        }
    } else {
        console.log("continue to receive chunks ...");
        const code = Kv.get(KEYS.CODE) || "";
        Kv.set(KEYS.CODE, code + body);
    }
    };

    const handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;

    // ping
    if (path === "/ping") {
        console.log("Hello from runner smart function 👋");
        return new Response("Pong");
    }

    //FIXME HACK : init KV storage and return
    if (path === "/init") return await init(request);

    //FIXME HACK : upload code chunks
    if (path === "/code") return new Response(await Kv.get(KEYS.CODE));

    const mode = Kv.get<BOOT_MODE>(KEYS.BOOT_MODE) || BOOT_MODE.CHUNKING;
    console.log("mode", mode);

    if (mode === BOOT_MODE.CHUNKING) {
        await chunker(request);
        return new Response();
    } else if (mode === BOOT_MODE.BOOTED) {
        return await run(request);
    }

    throw new Error("Unknown boot mode");
    };

    export default handler;
    ```
1. Remarks :
   - `/ping` is an endpoint for technical debugging and alive status
   - FIXME : `/init` is an endpoint to fix the issue that you cannot pass an initialization of the KV storage when you deploy your smart function. The administrator is set, and other constant like the fees and the default status of the contract
   - `/code` is the endpoint to receive the chunks. Chunks are encoded with **base64url and padding**. A last request with an empty payload mean that the transfer finished and the code can be decoded and ready to be evaluated for the next calls

1. Create the chunk script responsible for compiling your code and chunk it in base64 pieces. Add a base64 library supporting padding

    ```bash
    touch chunk.ts
    npm i @juanelas/base64
    ```` 
1. Edit the file

    ```typescript
    // SCRIPT CHUNKING A FILE IN X FILE < Ko

    import fs from "fs";
    import path from "path";
    import base64 from "@juanelas/base64"

    const MAX_FILE_SIZE = 3915 - 150; // 3915octet is the MAX

    function splitFile(inputPath: string, outputDir: string): void {
    const fileData = base64.encode(
        //JSON.stringify(
        fs
            .readFileSync(inputPath)
            .subarray(25, fs.readFileSync(inputPath).length - 2)
            .toString()
        //)
    ,true,true); // removing first 25 char and 2 last char semi colon + eof
    console.log(fileData);

    //console.log(atob(fileData))

    //2. get total size

    const fileSize = fileData.length;
    const numFiles = Math.ceil(fileSize / MAX_FILE_SIZE); //base 64 is bigger
    //3. loop x times to create x files <4ko

    for (let i = 0; i < numFiles; i++) {
        const start = i * MAX_FILE_SIZE;
        const end = Math.min((i + 1) * MAX_FILE_SIZE, fileSize);
        const chunk = fileData.slice(start, end);
        const outputPath = path.join(outputDir, `part-${i + 1}.txt`);
        fs.writeFileSync(outputPath, chunk);
        console.log(`Saved file chunk to ${outputPath}`);
    }

    console.log(`Successfully split file into ${numFiles} parts.`);
    }

    const [, , inputPath, outputDir] = process.argv;
    splitFile(inputPath, outputDir);
    ```

1. Add a new script line on `package.json` to run the chunker (note : it starts by compiling your index.ts file with iife standard), and another one to build the chunk proxy contract

    ```json
    "chunk": "esbuild index.ts --bundle --format=iife --global-name=\"handler\" --minify --outfile=dist/index_iife.js && npx tsx  chunk.ts dist/index_iife.js dist",
    "build_chunk": "esbuild ./chunk/index.ts --platform=node --bundle --format=esm --target=esnext --minify --outfile=dist/chunk/index.js  "
    ```

1. Compile the contract

    ```bash
    npm run build_chunk
    ```

1. Run the chunk script

    ```bash
    npm run chunk
    ```

1. Check the output logs and that some `part-<number>.txt` base64 encoded chunks have been creates on ./dist directory