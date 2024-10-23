import { match, P } from "ts-pattern";

//******************* types
type Bet = {
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
    "ADMIN" = "ADMIN"
};


//******************* functions

//FIXME : we consider that the user sent a deposit `amount` separately to this call as it is not possible right now to add money inside a request
const placeBet = (user: Address, selection: string, amount: number, odds: number): Response => {

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
    const bets = Kv.get<Map<string, Bet>>(KEYS.BETMAP)!;
    bets.set(betId, bet);

    console.log(`Bet placed: ${amount} on ${selection} at odds of ${odds}`);

    //save to storage
    Kv.set(KEYS.BETMAP, bets);
    return new Response(JSON.stringify({ id: betId }));
}

const resolveResult = (user: Address, optionResult: string, result: BET_RESULT): Response => {

    const admin = Kv.get<Address>(KEYS.ADMIN)!;
    if (user !== admin) {
        const errorMessage = "Only the admin " + admin + " can give the result.";
        console.error(errorMessage);
        return new Response(errorMessage, { status: 403 });
    }

    const status: BET_RESULT = Kv.get(KEYS.RESULT)!;
    if (status !== BET_RESULT.PENDING) {
        const errorMessage = "Result is already given and bets are resolved : " + status;
        console.error(errorMessage);
        return new Response(errorMessage, { status: 500 });
    }

    const bets = Kv.get<Map<string, Bet>>(KEYS.BETMAP)!;

    bets.forEach(bet => {
        //remove bet
        bets.delete(bet.id);
        const fees = Kv.get<number>(KEYS.FEES)!;
        if (result === BET_RESULT.WIN && bet.option === optionResult) {//WINNER!
            const earnings = bet.amount * calculateOdds(bet.option, 0); //TODO : CHECKTHIS
            console.log("earnings : " + earnings + " for " + bet.owner)
            Ledger.transfer(bet.owner, earnings);
        } else if (result === BET_RESULT.DRAW) { //GIVE BACK MONEY - FEES
            console.log("give back money : " + bet.amount * (1 - fees) + " for " + bet.owner)
            Ledger.transfer(bet.owner, bet.amount * (1 - fees));
        } else { //ERROR
            const errorMessage = "Only give winners or draw, not losers";
            console.error(errorMessage);
            return new Response(errorMessage, { status: 403 });
        }
    });

    Kv.set(KEYS.RESULT, result);

    return new Response();
}



const generateBetId = (): string => {
    return Math.random().toString(36).substr(2, 9);
}

const calculateOdds = (option: string, betAmount: number): number => {

    if (betAmount === 0) return 0; //special case

    const bets = Kv.get<Map<string, Bet>>(KEYS.BETMAP)!;
    const fees = Kv.get<number>(KEYS.FEES)!;
    const balance = Ledger.balance(Ledger.selfAddress);

    const totalLoserAmount = (Array.from(bets.values()).filter(bet => bet.option !== option).map(bet => bet.amount).reduce((acc, currentAmount) => acc + currentAmount, 0)) || 0;
    console.log("totalLoserAmount", totalLoserAmount);
    const totalWinnerAmount = (Array.from(bets.values()).filter(bet => bet.option == option).map(bet => bet.amount).reduce((acc, currentAmount) => acc + currentAmount, betAmount)) || 0;
    console.log("totalWinnerAmount", totalWinnerAmount);
    return (1 + totalLoserAmount / totalWinnerAmount) - fees;
}

const handler = async (request: Request): Promise<Response> => {

    //DEBUG
    //console.debug("handler request", request);

    // Extract the requester's address and message from the request
    const user = request.headers.get("Referer") as Address;
    const url = new URL(request.url);
    const path = url.pathname;
    let params = new URLSearchParams(url.search);

    // remove first / to simplify matching afte rthe split
    let pathCutArr = path.replace("/", "").split("/");

    try {
        return match(pathCutArr)
            //FIXME : not possible to initialize the State at deployment time for now
            .with(["init"], () => {
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
                    return new Response();
                }
            })
            .with(["ping"], () => {
                console.log("Hello from runner smart function 👋");
                return new Response("Pong");
            })
            .with(["bet"], async () => {
                if (request.method === "POST") {
                    const bet = await request.json();
                    console.log("user", user, "bet", bet); //FIXEM : need to extract the amount and remove it from bet.amount on teh param call below 
                    return placeBet(user, bet.option, bet.amount, calculateOdds(bet.option, bet.amount));
                }
                else if (request.method === "GET") {
                    return new Response(JSON.stringify(Array.from(Kv.get<Map<string, Bet>>(KEYS.BETMAP)!.values())));
                }
                else {
                    const error = "/bet is a GET or POST request";
                    console.error(error);
                    return new Response(error, { status: 500 });
                }

            })
            .with(["bet", P.string], async ([, betId]) => {

                if (request.method === "GET") {
                    return new Response(JSON.stringify(Array.from(Kv.get<Map<string, Bet>>(KEYS.BETMAP)!.values()).filter(bet => bet.id == betId)[0]));
                }
                else {
                    const error = "/bet is a GET or POST request";
                    console.error(error);
                    return new Response(error, { status: 500 });
                }
            })

            .with(["result"], async () => {
                if (request.method === "POST") {
                    const body: { option: string, result: BET_RESULT } = await request.json();
                    console.log("user", user, "body", body);
                    return resolveResult(user, body.option, body.result);
                }
                else if (request.method === "GET") {
                    return new Response(JSON.stringify({ result: Kv.get<BET_RESULT>(KEYS.RESULT)! }));
                }
                else {
                    const error = "/result is a GET or POST request";
                    console.error(error);
                    return new Response(error, { status: 500 });
                }
            })
            .with(["odds"], () => {

                if (params.size != 2 || !params.get("option") || !params.get("amount") || request.method !== "GET") {
                    const error = "GET method and option + amount parameters are mandatory";
                    console.error(error);
                    return new Response(error, { status: 500 });
                } else {
                    return new Response(JSON.stringify({ odds: calculateOdds(params.get("option")!, Number(params.get("amount")!)) }));
                }


            })
            .otherwise(() => {
                const error = `Unrecognised parsed entrypoint ${pathCutArr.toString()}`;
                console.error(error, pathCutArr);
                return new Response(error, { status: 404 });
            })

    } catch (error) {
        console.error(error);
        throw error;
    }

}

export default handler;
