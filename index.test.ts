
import { JstzHeaders } from '../jstz/packages/sdk';
import { expect, jest, test } from '@jest/globals';
import contract from './index';

const alice: Address = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
const bob: Address = "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6";
const contractAddr: Address = "tz1iLrb3CbYjuBQBvhKGj5SpuyXAjzK63Jps";

const headers: JstzHeaders = { "Content-Type": "application/json", "Referer": alice };

//mock state
globalThis.Kv = new Map();

//mock Ledger

const balances = new Map<Address, number>([[alice, 1000000], [bob, 100000], [contractAddr, 0]]);
const getBalances = (address: Address): number => balances.get(address)!;

globalThis.Ledger = {
    selfAddress: contractAddr,
    balance: getBalances,
    transfer: (address: Address, amount: Mutez): void => { console.log("Smart Function balance (before transfer) : " + balances.get(contractAddr)); console.log("Mocked transfer of " + amount + " to " + address); balances.set(contractAddr, balances.get(contractAddr)! - amount); console.log("Smart Function balance : " + balances.get(contractAddr)) }
}



//PING
const pingRequest = new Request("tezos://fake/ping");

describe('ping function', () => {
    test('should return Pong', async () => {
        const res = await contract(pingRequest);
        const result = await res.text();
        expect(result).toBe('Pong');
    });
});


// INIT
const initRequest = new Request("tezos://fake/init",
    {
        headers,
        method: "GET"
    });

describe('init function', () => {
    test('should be initialized', async () => {
        const res = await contract(initRequest);
        const result = await res.text();
        expect(res.status).toBe(200);
    });

    test('should not be initialized twice', async () => {
        const res = await contract(initRequest);
        const result = await res.text();
        expect(res.status).toBe(500);
    });
});


// BET SCENARIO


const betPUSHRequest = new Request(
    "tezos://fake/bet"
    , {
        method: "PUSH",
        body: JSON.stringify({
            option: "trump",
            amount: 1
        }),
        headers: headers
    }
);


const betRequest = new Request(
    "tezos://fake/bet");

const betTrump1Request = new Request(
    "tezos://fake/bet"
    , {
        method: "POST",
        body: JSON.stringify({
            option: "trump",
            amount: 1
        }),
        headers: headers
    }
);

const findBetRequest = (betId: string) => new Request(
    "tezos://fake/bet/" + betId
    , {
        method: "GET",
        headers: headers
    }
);

describe('bet function', () => {

    let betTrump1Id: string = "";

    test('should fail with a PUSH', async () => {
        const res = await contract(betPUSHRequest);
        expect(res.status).toBe(500);
    });


    test('should return a list of empty bets', async () => {
        const res = await contract(betRequest);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body).toEqual([]);
    });


    test('should return 200', async () => {
        const res = await contract(betTrump1Request);
        expect(res.status).toBe(200);
        const body = (await res.json());
        expect(body).not.toBeNull();
        expect(body.id).not.toBeNull();
        betTrump1Id = body.id;
    });

    test('should find the bet', async () => {
        const res = await contract(findBetRequest(betTrump1Id));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        // expect(body.owner).toEqual("tz1xxxx"); //FIXME how to do this ?
        expect(body.option).toEqual("trump");
        expect(body.amount).toEqual(1);
    });

});


