import { match, P } from "ts-pattern";
import { BET_RESULT, KEYS, Bet } from "../index.types";


export const ODDS_CONTRACT_ADDRESS = "ODDS_CONTRACT_ADDRESS";

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

const resolveResult = async (user: Address, optionResult: string, result: BET_RESULT): Promise<Response> => {

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

    if (result !== BET_RESULT.WIN && optionResult !== BET_RESULT.DRAW) {
        const errorMessage = "Only give winners or draw, no other choices";
        console.error(errorMessage);
        return new Response(errorMessage, { status: 500 });
    }

    const bets = Kv.get<Map<string, Bet>>(KEYS.BETMAP)!;

    await Promise.all(Array.from(bets.values()).map(async (bet) => {
        const fees = Kv.get<number>(KEYS.FEES)!;
        const oddResponse = await SmartFunction.call(
            new Request("tezos://" + Kv.get(ODDS_CONTRACT_ADDRESS) + "/odds?option=" + bet.option + "&amount=" + 0));
        if (result === BET_RESULT.WIN && bet.option === optionResult) {//WINNER!
            const earnings = bet.amount * (await oddResponse.json()).odds;
            console.log("earnings : " + earnings + " for " + bet.owner)
            Ledger.transfer(bet.owner, earnings);
        } else if (result === BET_RESULT.DRAW) { //GIVE BACK MONEY - FEES
            console.log("give back money : " + bet.amount * (1 - fees) + " for " + bet.owner)
            Ledger.transfer(bet.owner, bet.amount * (1 - fees));
        } else { //NEXT
            console.log("bet lost for " + bet.owner)
        }
    }));

    Kv.set(KEYS.RESULT, result);

    return new Response();
}

const generateBetId = (): string => {
    return Math.random().toString(36).substr(2, 9);
}

const handler = async (request: Request): Promise<Response> => {

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
                    const error = "State already initialized " + Kv.get(KEYS.RESULT);
                    console.error(error);
                    return new Response(error, { status: 500 });
                } else {
                    const referer = request.headers.get("Referer");
                    console.log("Initializing smart function state from admin " + referer);

                    //FIXME proxy stuff here
                    Kv.set(ODDS_CONTRACT_ADDRESS, params.get(ODDS_CONTRACT_ADDRESS)!);

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
                    const bet: Bet = await request.json();
                    console.log("user", user, "bet", bet); //FIXEM : need to extract the amount and remove it from bet.amount on teh param call below 
                    const oddResponse = await SmartFunction.call(
                        new Request(`tezos://${Kv.get("ODDS_CONTRACT_ADDRESS")!}/odds?option=` + bet.option + "&amount=" + bet.amount));
                    return placeBet(user, bet.option, bet.amount,
                        (await oddResponse.json()).odds
                    );
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
                    return await resolveResult(user, body.option, body.result);
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
            .with(["odds"], async () => {
                //FIXME : HACK to call child contracts
                return await SmartFunction.call(
                    new Request("tezos://${Kv.get(" + ODDS_CONTRACT_ADDRESS + ")!}/odds?option=" + params.get("option") + "&amount=" + params.get("amount")));

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
