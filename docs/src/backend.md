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
       "lib": ["esnext"],
       "module": "esnext",
       "target": "esnext",
       "strict": true,
       "moduleResolution": "node",
       "types": ["@jstz-dev/types", "jest"],
       "resolveJsonModule": true,
       "esModuleInterop": true
     },
     "exclude": ["node_modules"]
   }
   ```

1. Update the script section on `package.json` to build your app

   ```json
   "scripts": {
     "build": "esbuild index.ts --bundle --format=esm --target=esnext --minify --outfile=dist/index.js"
   }
   ```

1. Create a default index.ts file and a file for type declarations

   ```bash
   touch index.ts
   touch index.types.ts
   ```

   and edit `index.ts` with

   ```typescript
   import { KEYS, Bet, BET_RESULT } from "./index.types";
   const handler = async (request: Request): Promise<Response> => {
     return new Response();
   };

   export default handler;
   ```

   and `index.types.ts` with

   ```typescript
    //******************* types
    export type Bet = {
        id: string;
        owner: Address;
        option: string;
        amount: number;
    };

    export enum BET_RESULT {
        'WIN' = 'WIN',
        'DRAW' = 'DRAW',
        'PENDING' = 'PENDING'
    }

    //******************* state keys
    export enum KEYS {
        "FEES" = "FEES",
        "BETMAP" = "BETMAP",
        "RESULT" = "RESULT",
        "ADMIN" = "ADMIN",
        "BOOT_MODE" = "BOOT_MODE",
        "CODE" = "CODE"
    };
   ```

1. Compile

   ```bash
   npm run build
   ```

1. Code the handler

   1. Import this library to easily match url path

      ```bash
      npm i ts-pattern
      ```

   1. Define a part of the code for a betting platform. Edit `index.ts`

      ```typescript
      import { KEYS, Bet, BET_RESULT } from "./index.types";
      import { match } from "ts-pattern";

      //******************* functions

      //FIXME : we consider that the user sent a deposit `amount` separately to this call as it is not possible right now to add money inside a request
      const placeBet = (
        user: Address,
        selection: string,
        amount: number,
        odds: number
      ): Response => {
        //FIXME : `amount` will have to be natively supported by request later

        if (amount <= 0) {
          const errorMessage = "Bet amount must be positive.";
          console.error(errorMessage);
          return new Response(errorMessage, { status: 500 });
        }

        if (amount > Ledger.balance(user)) {
          const errorMessage = "Insufficient balance to place this bet.";
          console.error(errorMessage);
          return new Response(errorMessage, { status: 500 });
        }

        const betId = generateBetId();
        const bet: Bet = { id: betId, option: selection, amount, owner: user };
        const bets = new Map<string, Bet>(Object.entries(Kv.get(KEYS.BETMAP)!));
        bets.set(betId, bet);

        console.log(`Bet placed: ${amount} on ${selection} at odds of ${odds}`);

        //save to storage
        Kv.set(KEYS.BETMAP, Object.fromEntries(bets.entries()));

        console.log("BETMAP", Kv.get(KEYS.BETMAP)!);
        return new Response(JSON.stringify({ id: betId }));
      };

      const generateBetId = (): string => {
        console.log("Calling generateBetId");
        return Math.random().toString(36).slice(2, 9);
      };

      /**
       *
       * @param option
       * @param betAmount (Optional) if user want to know the output gain after putting some money on it. Otherwise it gives actual gain without betting and influencing odds calculation
       * @returns
       */
      const calculateOdds = (option: string, betAmount?: number): number => {
        const bets = new Map<string, Bet>(
          Object.entries(Kv.get<Map<string, Bet>>(KEYS.BETMAP)!)
        );
        const fees = Kv.get<number>(KEYS.FEES)!;

        const totalLoserAmount =
          [...bets.values()]
            .filter((bet) => bet.option !== option)
            .map((bet) => bet.amount)
            .reduce((acc, currentAmount) => acc + currentAmount, 0) || 0;
        console.log("totalLoserAmount", totalLoserAmount);
        const totalWinnerAmount =
          [...bets.values()]
            .filter((bet) => bet.option == option)
            .map((bet) => bet.amount)
            .reduce(
              (acc, currentAmount) => acc + currentAmount,
              betAmount ? betAmount : 0
            ) || 0;
        console.log("totalWinnerAmount", totalWinnerAmount);
        return 1 + totalLoserAmount / totalWinnerAmount - fees;
      };

      //******************* handler

      const handler = async (request: Request): Promise<Response> => {
        // Extract the requester's address and message from the request
        const user = request.headers.get("Referer") as Address;
        const url = new URL(request.url);
        const path = url.pathname;

        console.debug("path", path);

        let params = url.searchParams;

        console.debug("params", params);

        // remove first / to simplify matching after the split
        let pathCutArr = path.replace("/", "").split("/");

        try {
          return match(pathCutArr)
            .with(["bet"], async () => {
              console.debug("bet called");

              if (request.method === "POST") {
                const bet = await request.json();
                console.log("user", user, "bet", bet);
                return placeBet(
                  user,
                  bet.option,
                  bet.amount,
                  calculateOdds(bet.option, bet.amount)
                );
              } else if (request.method === "GET") {
                console.debug("bet GET called");

                console.log("BETMAP", Kv.get(KEYS.BETMAP)!);

                const betmap = new Map<string, Bet>(
                  Object.entries(Kv.get(KEYS.BETMAP)!)
                );
                console.debug("betmap", betmap);

                const bets = [...betmap!.values()];

                console.debug("bets", bets);

                return new Response(JSON.stringify(bets));
              } else {
                const error = "/bet is a GET or POST request";
                console.error(error);
                return new Response(error, { status: 500 });
              }
            })
            .otherwise(() => {
              const error = `Unrecognised parsed entrypoint ${pathCutArr.toString()}`;
              console.error(error, pathCutArr);
              return new Response(error, { status: 404 });
            });
        } catch (error) {
          console.error(error);
          throw error;
        }
      };

      export default handler;
      ```

   1. Remarks :
      - Not all Node specific functions are supported. Avoid : Array.from, ... 
      - You should avoid deprecated functions as much as possible. Ex : String.subtr, ... 
      - FIXME : you cannot extract the amount on a received transaction, because it is not yet available to to so. So for yours tests or frontend app, you will have to send manually money with jstz CLI. It is not MVP-ready yet
      - be careful with the usage of the KV map when you store object as a value. For example, when you want to store a map into the KV storage, as the KV store is also a map itself, you have to extract all elements to be well serialized into the map. Otherwise during deserialization, the value will be an empty object

1. Compile

   ```bash
   npm run build
   ```