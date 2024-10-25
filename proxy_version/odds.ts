
import { match, P } from "ts-pattern";

import { BET_RESULT, KEYS, Bet } from "../index.types";


/**
      * 
      * @param option 
      * @param betAmount (Optional) if user want to know the output gain after putting some money on it. Otherwise it gives actual gain without betting and influencing odds calculation 
      * @returns 
      */
const calculateOdds = (option: string, betAmount?: number): number => {

    const bets = Kv.get<Map<string, Bet>>(KEYS.BETMAP)!;
    const fees = Kv.get<number>(KEYS.FEES)!;
    const balance = Ledger.balance(Ledger.selfAddress);

    const totalLoserAmount = (Array.from(bets.values()).filter(bet => bet.option !== option).map(bet => bet.amount).reduce((acc, currentAmount) => acc + currentAmount, 0)) || 0;
    console.log("totalLoserAmount", totalLoserAmount);
    const totalWinnerAmount = (Array.from(bets.values()).filter(bet => bet.option == option).map(bet => bet.amount).reduce((acc, currentAmount) => acc + currentAmount, betAmount ? betAmount : 0)) || 0;
    console.log("totalWinnerAmount", totalWinnerAmount);
    return (1 + totalLoserAmount / totalWinnerAmount) - fees;
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

            .with(["odds"], async () => {

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