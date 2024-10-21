import { useState } from 'react'

import './App.css'

import { Jstz, User } from "@jstz-dev/sdk";

import { Buffer } from 'buffer/'

const DEFAULT_ENDPOINT = "localhost:8933";
const DEFAULT_URI = "tezos://tz1iLrb3CbYjuBQBvhKGj5SpuyXAjzK63Jps";

/*
const USER_ALICE = {
  address: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
  publicKey: "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn",
  secretKey: "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
};
*/

const USER_TAQUITO = {
  address: "tz1eVqP1XNL9SCrrgkXgV5ZcteSULwiykDZ8",
  publicKey: "edpkvUyfMw7iPYYtc4Pg6d1JzupazvreB6KVgAB8V7Gm59vZbKsuQo",
  secretKey: "edsk3wHLmZQf7M3zQGENjpNEfFbAnpDyudJjM4aDmKc6TLYK8SuCjY"
}

/*
const SignUp: React.FC<{ addUser: (name: string, user: User) => void }> = ({
  addUser,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const signup = () => {
    const user: User = { address, publicKey, secretKey };
    addUser(name, user);
    alert("User signed up");
  };

  return (
    <div>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Address:</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div>
        <label>Public Key:</label>
        <input
          type="text"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
        />
      </div>
      <div>
        <label>Secret Key:</label>
        <input
          type="text"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />
      </div>
      <button onClick={signup}>Sign Up</button>
    </div>
  );
};
*/
const Ping: React.FC<{ endpoint: string; user: User, setError: (s: string) => void }> = ({
  endpoint,
  user,
  setError
}) => {
  const [uri, setUri] = useState(DEFAULT_URI);
  const [functionResult, setFunctionResult] = useState(0);

  const ping = async () => {
    try {
      const result = await new Jstz(endpoint).run(user, { uri: uri + "/ping" });
      setFunctionResult(result.statusCode == 200 && Buffer.from(result.body).toString().toLowerCase() == "pong" ? 200 : result.statusCode);
    } catch (error) {
      console.error("ERROR", error);
      setError(typeof error === "string" ? error : (error as Error).message + "\n" + (error as Error).stack);
    }

  };

  return (
    <span style={{ alignContent: "center", paddingLeft: 100 }}>
      <button onClick={ping}>Ping {uri}</button>
      {functionResult == 200 ? <>&#128994;</> : <>&#128308;</>}
    </span>
  );
};



const BetFunction: React.FC<{ endpoint: string; user: User, setError: (s: string) => void }> = ({
  endpoint,
  user,
  setError
}) => {
  const [uri, setUri] = useState(DEFAULT_URI + "/bet");
  const [functionResult, setFunctionResult] = useState(0);


  const [amount, setAmount] = useState(0);
  const [option, setOption] = useState("trump");


  const runFunction = async () => {
    try {



      console.log("**********", JSON.stringify({
        option,
        amount
      }));

      const result = await new Jstz(endpoint).run(user, {
        uri: uri,
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: Buffer.from(JSON.stringify({
          option,
          amount
        }))
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
      setError(typeof error === "string" ? error : (error as Error).message + "\n" + (error as Error).stack);
    }

  };

  return (
    <span style={{ alignContent: "center", width: "100%" }}>
      <h3 >Choose candidate</h3>

      <select name="options" onChange={(e) => setOption(e.target.value)} value={option} >
        <option value="trump" >
          Donald Trump</option>
        <option value="harris" >
          Kamala Harris</option>
      </select>
      <h3 >Amount</h3>
      <input type="number" id="amount" name="amount" required onChange={(e) => setAmount(Number(e.target.value))} />


      <hr />
      <button onClick={runFunction}>Bet</button>

      <table style={{ fontWeight: "normal", width: "100%" }}>
        <tr><td style={{ textAlign: "left" }}>Avg price</td><td style={{ textAlign: "right" }}>60.6¢</td></tr>
        <tr><td style={{ textAlign: "left" }}>Shares</td><td style={{ textAlign: "right" }}>16.50</td></tr>
        <tr><td style={{ textAlign: "left" }}>Potential return</td><td style={{ textAlign: "right" }}>$16.50 (65.01%)</td></tr>

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
      <header >
        <span style={{ display: "flex" }}>
          <h1>Polymarktez </h1>

          <div style={{ alignContent: "flex-end", marginLeft: "auto" }}> Cash : ${balance}  <div className="chip">
            <img src="https://cdn.britannica.com/66/226766-138-235EFD92/who-is-President-Joe-Biden.jpg?w=800&h=450&c=crop" alt="Person" width="96" height="96" />
            Joe Biden
          </div> </div>
        </span>
      </header>

      <div id="content" style={{ display: "flex", paddingTop: 10 }}>

        <div style={{ width: "calc(66vw - 4rem)" }}>
          <span style={{ display: "flex" }}>
            <img style={{ width: "72px", paddingRight: 15 }} src="https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fpresidential-election-winner-2024-afdda358-219d-448a-abb5-ba4d14118d71.png&w=1018&q=100"></img>
            <h2>Presidential Election Winner 2024</h2>
          </span>
          <img style={{ width: "inherit" }} src='./graph.png'></img>


          <hr />

          <table style={{ width: "inherit" }}>

            <tr>
              <th>Outcome</th>
              <th>% chance</th>
            </tr>

            <tr ><td className='tdTable'>


              <div className='picDiv'>
                <img style={{ objectFit: "cover", height: "inherit" }} src='https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fwill-donald-trump-win-the-2024-us-presidential-election-c83f01bb-5089-4222-9347-3f12673b6a48.png&w=1018&q=100'></img>
              </div>

              Donald Trump</td ><td >59.5%</td></tr>
            <tr><td className='tdTable'>


              <div className='picDiv'>
                <img style={{ objectFit: "cover", height: "inherit" }} src='https://polymarket.com/_next/image?url=https%3A%2F%2Fpolymarket-upload.s3.us-east-2.amazonaws.com%2Fwill-kamala-harris-win-the-2024-us-presidential-election-21483ac3-94a5-4efd-b89e-05cdca69753f.png&w=1018&q=100'></img>
              </div>


              Kamala Harris</td><td >40.3%</td></tr>

          </table>

        </div>

        <div style={{
          width: "calc(33vw - 4rem)", boxShadow: "", margin: "1rem",
          borderRadius: "12px",
          border: "1px solid #344452",
          padding: "1rem"
        }}>

          <span className='tdTable'>

            <BetFunction endpoint={DEFAULT_ENDPOINT} setError={setError} user={USER_TAQUITO} />

          </span>

        </div>



      </div >

      <footer>

        <h3>Errors</h3>

        <textarea readOnly rows={10} style={{ width: "100%" }} value={error}>


        </textarea>

        <Ping endpoint={DEFAULT_ENDPOINT} user={USER_TAQUITO} setError={setError} />


      </footer>

    </>
  )
}

export default App
