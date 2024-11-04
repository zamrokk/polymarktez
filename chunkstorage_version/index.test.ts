

import { expect, jest, test } from '@jest/globals';
import contract, { BOOT_MODE } from './index';
import { BET_RESULT, KEYS } from '../index.types';
import * as fs from 'fs';
const alice: Address = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
const bob: Address = "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6";
const contractAddr: Address = "tz1iLrb3CbYjuBQBvhKGj5SpuyXAjzK63Jps";

const headers = (user: Address): HeadersInit => [["Content-Type", "application/json"], ["Referer", user]];

//mock state
globalThis.Kv = new Map();

//mock Ledger
const initAmount = 1000000;
const balances = new Map<Address, number>([[alice, initAmount], [bob, initAmount], [contractAddr, 0]]);
const getBalances = (address: Address): number => balances.get(address)!;

globalThis.Ledger = {
    selfAddress: contractAddr,
    balance: getBalances,
    transfer: (address: Address, amount: Mutez): void => {
        console.log("Smart Function balance (before transfer) : " + balances.get(contractAddr));
        console.log("Mocked transfer of " + amount + " to " + address);
        balances.set(contractAddr, balances.get(contractAddr)! - amount);
        balances.set(address, balances.get(address)! + amount);
        console.log("Smart Function balance : " + balances.get(contractAddr))
        console.log("Receiver balance : " + balances.get(contractAddr))
    }
}


// INIT
const initRequest = new Request("tezos://fake/init",
    {
        headers: headers(alice),
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


//CHUNKS

const chunkRequest = async (filepath: string, stop?: boolean) => new Request("tezos://fake/chunk",
    {
        headers: [["Content-Type", "text/plain"], ["Referer", alice]],
        method: "POST",
        body: stop ? "" : await fs.promises.readFile(filepath, 'utf8')
    });

describe('chunk function', () => {
    test('should store chunk 1/3', async () => {
        const res = await contract(await chunkRequest("./dist/part-1.txt"));
        expect(res.status).toBe(200);
        expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);

    });


    test('should store chunk 2/3', async () => {
        const res = await contract(await chunkRequest("./dist/part-2.txt"));
        expect(res.status).toBe(200);
        expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);

    });

    test('should store chunk 3/3', async () => {
        const res = await contract(await chunkRequest("./dist/part-3.txt"));
        expect(res.status).toBe(200);
        expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);
    });

    test('should store chunk 4/4', async () => {
        const res = await contract(await chunkRequest("./dist/part-4.txt"));
        expect(res.status).toBe(200);
        expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);
    });

    test('should store chunk 5/5', async () => {
        const res = await contract(await chunkRequest("./dist/part-5.txt"));
        expect(res.status).toBe(200);
        expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);
    });

    test('should stop empty chunk 6/5', async () => {
        const res = await contract(await chunkRequest("", true));
        expect(res.status).toBe(200);
        expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.BOOTED);
    });



});



//PING
const pingRequest = new Request("tezos://fake/ping");

describe('ping function', () => {
    test('should return Pong', async () => {
        const res = await contract(pingRequest);
        const result = await res.text();
        expect(result).toBe('Pong');
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
        headers: headers(alice)
    }
);


const betRequest = new Request(
    "tezos://fake/bet");

const betOnRequest = (option: string, amount: number, user: Address) => new Request(
    "tezos://fake/bet"
    , {
        method: "POST",
        body: JSON.stringify({
            option,
            amount
        }),
        headers: headers(user)
    }
);





const findBetRequest = (betId: string) => new Request(
    "tezos://fake/bet/" + betId
    , {
        method: "GET",
        headers: headers(alice)
    }
);


const getOddsRequest = (option: string, betAmount: number) => new Request(
    "tezos://fake/odds?option=" + option + "&amount=" + betAmount
    , {
        method: "GET",
        headers: headers(alice)
    }
);

describe('bet function', () => {

    let betTrump1Id: string = "";
    let betKamala2Id: string = "";


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

        //FIXME : manually send money to the contract
        balances.set(contractAddr, balances.get(contractAddr)! + 1);

        const res = await contract(betOnRequest("trump", 1, alice));
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
        expect(body.owner).toEqual(alice);
        expect(body.option).toEqual("trump");
        expect(body.amount).toEqual(1);
    });

    test('should get a correct odd of 0.9 (including fees)', async () => {
        const res = await contract(getOddsRequest("trump", 1));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.odds).toEqual(0.9);
    });


    test('should return 200', async () => {

        //FIXME : manually send money to the contract
        balances.set(contractAddr, balances.get(contractAddr)! + 2);

        //change to bob requester
        const res = await contract(betOnRequest("kamala", 2, bob));
        expect(res.status).toBe(200);
        const body = (await res.json());
        expect(body).not.toBeNull();
        expect(body.id).not.toBeNull();
        betKamala2Id = body.id;
    });

    test('should find the bet', async () => {
        const res = await contract(findBetRequest(betKamala2Id));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.owner).toEqual(bob);
        expect(body.option).toEqual("kamala");
        expect(body.amount).toEqual(2);
    });

    test('should get a correct odd of 1.9 for trump (including fees)', async () => {
        const res = await contract(getOddsRequest("trump", 1));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.odds).toEqual(1.9);
    });

    test('should get a correct odd of 1.23333 for kamala (including fees)', async () => {
        const res = await contract(getOddsRequest("kamala", 1));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.odds).toEqual(1 + 1 / 3 - 0.1);
    });


});



const resultRequest = new Request(
    "tezos://fake/result");

const resultOnRequest = (option: string, result: BET_RESULT) => new Request(
    "tezos://fake/result"
    , {
        method: "POST",
        body: JSON.stringify({
            option,
            result
        }),
        headers: headers(alice)
    }
);


describe('result function', () => {



    test('should return 200 with all correct balances', async () => {

        const res = await contract(resultOnRequest("trump", BET_RESULT.WIN));
        expect(res.status).toBe(200);

        expect(balances.get(contractAddr)).toBeCloseTo(0.1, 5);
        expect(balances.get(alice)).toBeCloseTo(initAmount + 2.9, 5);
        expect(balances.get(bob)).toBeCloseTo(initAmount + 0, 5);

    });

    test('should have state finalized', async () => {
        const res = await contract(resultRequest);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).not.toBeNull();
        expect(body.result).toEqual(BET_RESULT.WIN);
    });

    test('should return 500 if we try to reapply results', async () => {

        const res = await contract(resultOnRequest("trump", BET_RESULT.WIN));
        expect(res.status).toBe(500);

    });


});
