# Frontend

1. Create a frontend app. Here we use deno, vite and React to start a default project

    ```bash
    deno run -A npm:create-vite@latest
    ```

1. Choose a name, React, Typescript

1. Run the commands of the output

    ```bash
    cd app
    npm install
    npm run dev
    ```

1. FIXME : There is not yet an npm package for jstz SDK, so you have to compile the source code and set a dependency with a relative path

    1. Clone the jstz git repository [https://github.com/jstz-dev/jstz.git](https://github.com/jstz-dev/jstz.git)

    1. Install Nix (2.24.9)

    1. Run Nix

    ```bash
    nix develop --extra-experimental-features nix-command --extra-experimental-features flakes
    ```

    1. Go for a very long coffee ☕

    1. Go to `packages/sdk` folder and build it (don't worries about error outputs)

        ```bash
        npm run build
        ``` 

1. Go back to your project and import the SDK. Replace `<path_to_jstz_project>` by your actual relative path

    ```bash
    npm i  @jstz-dev/sdk@file:<path_to_jstz_project>/packages/sdk
    ```

1. Here we need Buffer library, there is a simple way to do so, just add this dependency below. Trick is then to use this import declaration later `import { Buffer } from "buffer/";` on your code.

    ```bash
    npm i buffer
    ```

1. Add vite plugins

    ```bash
    npm i -D vite-plugin-top-level-await vite-plugin-wasm
    ```

1. Edit vite config on `vite.config.ts`

    ```Typescript
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    import wasm from 'vite-plugin-wasm';

    import topLevelAwait from "vite-plugin-top-level-await";

    // https://vitejs.dev/config/
    export default defineConfig({
    plugins: [react(), wasm(), topLevelAwait()],
    build: {
        sourcemap: true,
    },
    resolve: {
        alias: {
        process: "process/browser"
        }
    }

    })
    ```

1. Edit `App.tsx`

    ```Typescript
    import { useState } from "react";

    import "./App.css";

    import { Jstz, JstzHeaders, User } from "@jstz-dev/sdk";

    import { Buffer } from "buffer/";

    const DEFAULT_ENDPOINT = "localhost:8933";
    const DEFAULT_URI = "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p";

    /*
    const USER_ALICE = {
    address: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
    publicKey: "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn",
    secretKey: "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
    };

    const USER_BOB = {
    address: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
    publicKey: "edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4",
    secretKey: "edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"
    };
    */

    const USER_TAQUITO = {
    address: "tz1eVqP1XNL9SCrrgkXgV5ZcteSULwiykDZ8",
    publicKey: "edpkvUyfMw7iPYYtc4Pg6d1JzupazvreB6KVgAB8V7Gm59vZbKsuQo",
    secretKey: "edsk3wHLmZQf7M3zQGENjpNEfFbAnpDyudJjM4aDmKc6TLYK8SuCjY",
    };

    const Ping: React.FC<{
    endpoint: string;
    user: User;
    setError: (s: string) => void;
    }> = ({ endpoint, user, setError }) => {
    const [uri, setUri] = useState(DEFAULT_URI);
    const [functionResult, setFunctionResult] = useState(0);

    const ping = async () => {
        try {
        const result = await new Jstz(endpoint).run(user, { uri: uri + "/ping" });
        setFunctionResult(
            result.statusCode == 200 &&
            Buffer.from(result.body).toString().toLowerCase() == "pong"
            ? 200
            : result.statusCode
        );
        } catch (error) {
        console.error("ERROR", error);
        setError(
            typeof error === "string"
            ? error
            : (error as Error).message + "\n" + (error as Error).stack
        );
        }
    };

    return (
        <span style={{ alignContent: "center", paddingLeft: 100 }}>
        <button onClick={ping}>Ping {uri}</button>
        {functionResult == 200 ? <>&#128994;</> : <>&#128308;</>}
        </span>
    );
    };

    const BetFunction: React.FC<{
    endpoint: string;
    user: User;
    setError: (s: string) => void;
    }> = ({ endpoint, user, setError }) => {
    const [uri, setUri] = useState(DEFAULT_URI + "/bet");
    const [functionResult, setFunctionResult] = useState(0);

    const [amount, setAmount] = useState(0);
    const [option, setOption] = useState("trump");

    const runFunction = async () => {
        try {
        const body = {
            option,
            amount,
        };

        const headers: JstzHeaders = { "Content-Type": "application/json" };

        const result = await new Jstz(endpoint).run(user, {
            uri,
            method: "POST",
            headers: headers,
            body: Buffer.from(JSON.stringify(body)), //FIXME BUG HERE Json not deserialize correctly on JsTz node
        });
        setFunctionResult(result.statusCode);
        if (result.statusCode != 200) {
            const error = Buffer.from(result.body).toString();
            setError(error);
            console.log(error);
            setFunctionResult(result.statusCode);
        }
        } catch (error) {
        console.error("ERROR", error);
        setFunctionResult(0);
        setError(
            typeof error === "string"
            ? error
            : (error as Error).message + "\n" + (error as Error).stack
        );
        }
    };

    return (
        <span style={{ alignContent: "center", width: "100%" }}>
        <h3>Choose candidate</h3>

        <select
            name="options"
            onChange={(e) => setOption(e.target.value)}
            value={option}
        >
            <option value="trump">Donald Trump</option>
            <option value="harris">Kamala Harris</option>
        </select>
        <h3>Amount</h3>
        <input
            type="number"
            id="amount"
            name="amount"
            required
            onChange={(e) => setAmount(Number(e.target.value))}
        />

        <hr />
        <button onClick={runFunction}>Bet</button>

        <table style={{ fontWeight: "normal", width: "100%" }}>
            <tr>
            <td style={{ textAlign: "left" }}>Avg price</td>
            <td style={{ textAlign: "right" }}>60.6¢</td>
            </tr>
            <tr>
            <td style={{ textAlign: "left" }}>Shares</td>
            <td style={{ textAlign: "right" }}>16.50</td>
            </tr>
            <tr>
            <td style={{ textAlign: "left" }}>Potential return</td>
            <td style={{ textAlign: "right" }}>$16.50 (65.01%)</td>
            </tr>
        </table>
        </span>
    );
    };

    function App() {
    const [count, setCount] = useState(0);
    const [error, setError] = useState("");
    const [balance, setBalance] = useState(0);

    return (
        <>
        <header>
            <span style={{ display: "flex" }}>
            <h1>Polymarktez </h1>

            <div style={{ alignContent: "flex-end", marginLeft: "auto" }}>
                {" "}
                Cash : ${balance}{" "}
                <div className="chip">
                <img
                    src="https://cdn.britannica.com/66/226766-138-235EFD92/who-is-President-Joe-Biden.jpg?w=800&h=450&c=crop"
                    alt="Person"
                    width="96"
                    height="96"
                />
                Joe Biden
                </div>{" "}
            </div>
            </span>
        </header>

        <div id="content" style={{ display: "flex", paddingTop: 10 }}>
            <div style={{ width: "calc(66vw - 4rem)" }}>
            <span style={{ display: "flex" }}>
                <img
                style={{ width: "72px", paddingRight: 15 }}
                src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fpresidential-election-winner-2024-afdda358-219d-448a-abb5-ba4d14118d71.png&w=1018&q=100"
                ></img>
                <h2>Presidential Election Winner 2024</h2>
            </span>
            <img style={{ width: "inherit" }} src="./graph.png"></img>

            <hr />

            <table style={{ width: "inherit" }}>
                <tr>
                <th>Outcome</th>
                <th>% chance</th>
                </tr>

                <tr>
                <td className="tdTable">
                    <div className="picDiv">
                    <img
                        style={{ objectFit: "cover", height: "inherit" }}
                        src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fwill-donald-trump-win-the-2024-us-presidential-election-c83f01bb-5089-4222-9347-3f12673b6a48.png&w=1018&q=100"
                    ></img>
                    </div>
                    Donald Trump
                </td>
                <td>59.5%</td>
                </tr>
                <tr>
                <td className="tdTable">
                    <div className="picDiv">
                    <img
                        style={{ objectFit: "cover", height: "inherit" }}
                        src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fwill-kamala-harris-win-the-2024-us-presidential-election-21483ac3-94a5-4efd-b89e-05cdca69753f.png&w=1018&q=100"
                    ></img>
                    </div>
                    Kamala Harris
                </td>
                <td>40.3%</td>
                </tr>
            </table>
            </div>

            <div
            style={{
                width: "calc(33vw - 4rem)",
                boxShadow: "",
                margin: "1rem",
                borderRadius: "12px",
                border: "1px solid #344452",
                padding: "1rem",
            }}
            >
            <span className="tdTable">
                <BetFunction
                endpoint={DEFAULT_ENDPOINT}
                setError={setError}
                user={USER_TAQUITO}
                />
            </span>
            </div>
        </div>

        <footer>
            <h3>Errors</h3>

            <textarea
            readOnly
            rows={10}
            style={{ width: "100%" }}
            value={error}
            ></textarea>

            <Ping
            endpoint={DEFAULT_ENDPOINT}
            user={USER_TAQUITO}
            setError={setError}
            />
        </footer>
        </>
    );
    }

    export default App;
    ```

1. To fix css , edit `App.css`

    ```css
    #root {
    margin: 0 auto;
    padding: 2rem;
    text-align: center;

    width: 100vw;
    height: calc(100vh - 4rem);
    }

    .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
    }

    .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.react:hover {
    filter: drop-shadow(0 0 2em #61dafbaa);
    }

    @keyframes logo-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
    }

    @media (prefers-reduced-motion: no-preference) {
    a:nth-of-type(2) .logo {
        animation: logo-spin infinite 20s linear;
    }
    }

    header {
    border-bottom: 1px solid #2C3F4F;
    height: 100px;
    }

    footer {
    border-top: 1px solid #2C3F4F;
    height: 100%
    }

    hr {
    color: #2C3F4F;
    height: 1px;
    }

    .tdTable {
    align-items: center;
    gap: 1rem;
    width: 100%;
    flex: 3 1 0%;
    display: flex;
    font-weight: bold;
    }

    .picDiv {


    height: 40px;
    width: 40px;
    min-width: 40px;
    border-radius: 999px;
    position: relative;
    overflow: hidden;
    }

    .card {
    padding: 2em;
    }

    .read-the-docs {
    color: #888;
    }

    #content {}

    .chip {
    display: inline-block;

    padding: 0 25px;
    height: 50px;
    font-size: 16px;
    line-height: 50px;
    border-radius: 25px;
    background-color: transparent;
    }


    h1 {
    margin: unset;
    }

    .chip img {
    float: left;
    margin: 0 10px 0 -25px;
    height: 50px;
    width: 50px;
    border-radius: 50%;
    object-fit: cover;
    }
    ```

1. Add `index.css`

    ```css
    :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #1D2B39;



    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    }

    a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
    }

    a:hover {
    color: #535bf2;
    }

    body {
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 320px;
    min-height: 100vh;

    }

    h1 {
    font-size: 3.2em;
    line-height: 1.1;
    }

    button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #2D9CDB;
    cursor: pointer;
    transition: border-color 0.25s;
    }

    button:hover {
    border-color: #646cff;
    }

    button:focus,
    button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
    }

    select {
    width: inherit;
    font-size: 0.875rem;
    color: #858D92;
    border-color: #344452;
    transition: color 0.2s;
    text-align: center;
    border-width: 1px;
    border-style: solid;
    align-self: center;
    padding: 1rem 1rem;
    background: #1D2B39;
    outline: none;
    outline-color: currentcolor;
    outline-style: none;
    outline-width: medium;
    border-radius: 8px;
    }

    input {
    width: calc(100% - 35px);
    font-size: 0.875rem;
    color: #858D92;
    border-color: #344452;
    transition: color 0.2s;
    text-align: center;
    border-width: 1px;
    border-style: solid;
    align-self: center;
    padding: 1rem 1rem;
    background: #1D2B39;
    outline: none;
    outline-color: currentcolor;
    outline-style: none;
    outline-width: medium;
    border-radius: 8px;
    }

    @media (prefers-color-scheme: light) {
    :root {
        color: #213547;
        background-color: #ffffff;
    }

    a:hover {
        color: #747bff;
    }

    button {
        background-color: #f9f9f9;
    }
    }
    ```

1. Check that your local jstz sandbox is running and your contract is deployed on it. If necessary, replace the value of this variable `DEFAULT_URI` to your contract address on `App.tsx` line 10

1. Run your app

    ```bash
    npm run dev
    ```

1. Click on the Ping button at the bottom. It should pass to green if you receive a `200 Pong`

    > Don't worry about the missing picture in the middle of the page, you can edit with a real graph later

1. Remarks

    - `DEFAULT_URI` has to start with `tezos://` protocol name
    - `USER_TAQUITO` is the account I generated with jstz CLI. For the moment it is not possible to login with a wallet
    - FIXME : There is a bug right now on POST request with a non empty body, you can find this on teh code `body: Buffer.from(JSON.stringify(body))...` but it does not work yet 