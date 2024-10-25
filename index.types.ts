
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
    "ADMIN" = "ADMIN"
};
