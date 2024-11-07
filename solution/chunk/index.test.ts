import { expect, test } from "@jest/globals";
import contract, { BOOT_MODE } from "./index";
import {  Bet, KEYS } from "../index.types";
import * as fs from "fs";
const alice: Address = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
const bob: Address = "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6";
const contractAddr: Address = "tz1iLrb3CbYjuBQBvhKGj5SpuyXAjzK63Jps";

const headers = (user: Address): HeadersInit => [
  ["Content-Type", "application/json"],
  ["Referer", user],
];

//mock state
globalThis.Kv = new Map();

//mock Ledger
const initAmount = 1000000;
const balances = new Map<Address, number>([
  [alice, initAmount],
  [bob, initAmount],
  [contractAddr, 0],
]);
const getBalances = (address: Address): number => balances.get(address)!;

globalThis.Ledger = {
  selfAddress: contractAddr,
  balance: getBalances,
  transfer: (address: Address, amount: Mutez): void => {
    console.log(
      "Smart Function balance (before transfer) : " + balances.get(contractAddr)
    );
    console.log("Mocked transfer of " + amount + " to " + address);
    balances.set(contractAddr, balances.get(contractAddr)! - amount);
    balances.set(address, balances.get(address)! + amount);
    console.log("Smart Function balance : " + balances.get(contractAddr));
    console.log("Receiver balance : " + balances.get(contractAddr));
  },
};

// INIT
const initRequest = new Request("tezos://fake/init", {
  headers: headers(alice),
  method: "GET",
});

describe("init function", () => {
  test("should be initialized", async () => {
    const res = await contract(initRequest);
    const result = await res.text();
    expect(res.status).toBe(200);
  });

  test("should not be initialized twice", async () => {
    const res = await contract(initRequest);
    const result = await res.text();
    expect(res.status).toBe(500);
  });
});

//CHUNKS

const chunkRequest = async (filepath: string, stop?: boolean) =>
  new Request("tezos://fake/chunk", {
    headers: [
      ["Content-Type", "text/plain"],
      ["Referer", alice],
    ],
    method: "POST",
    body: stop ? "" : await fs.promises.readFile(filepath, "utf8"),
  });

describe("chunk function", () => {
  test("should store chunk 1/3", async () => {
    const res = await contract(await chunkRequest("./dist/part-1.txt"));
    expect(res.status).toBe(200);
    expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);
  });

  test("should store chunk 2/3", async () => {
    const res = await contract(await chunkRequest("./dist/part-2.txt"));
    expect(res.status).toBe(200);
    expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);
  });

  test("should store chunk 3/3", async () => {
    const res = await contract(await chunkRequest("./dist/part-3.txt"));
    expect(res.status).toBe(200);
    expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.CHUNKING);
  });

  test("should stop empty chunk 4/3", async () => {
    const res = await contract(await chunkRequest("", true));
    expect(res.status).toBe(200);
    expect(Kv.get(KEYS.BOOT_MODE)).toEqual(BOOT_MODE.BOOTED);
  });
});

//PING
const pingRequest = new Request("tezos://fake/ping");

describe("ping function", () => {
  test("should return Pong", async () => {
    const res = await contract(pingRequest);
    const result = await res.text();
    expect(result).toBe("Pong");
  });
});

// BET SCENARIO

const betRequest = new Request("tezos://fake/bet");

const betOnRequest = (option: string, amount: number, user: Address) =>
  new Request("tezos://fake/bet", {
    method: "POST",
    body: JSON.stringify({
      option,
      amount,
    }),
    headers: headers(user),
  });

describe("bet function", () => {
  let betTrump1Id: string = "";
  let betKamala2Id: string = "";

  test("should return a list of empty bets", async () => {
    const res = await contract(betRequest);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).not.toBeNull();
    expect(body).toEqual([]);
  });

  test("should return 200", async () => {
    //FIXME : manually send money to the contract
    balances.set(contractAddr, balances.get(contractAddr)! + 1);

    const res = await contract(betOnRequest("trump", 1, alice));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).not.toBeNull();
    expect(body.id).not.toBeNull();
    betTrump1Id = body.id;
  });

  test("should return 200", async () => {
    //FIXME : manually send money to the contract
    balances.set(contractAddr, balances.get(contractAddr)! + 2);

    //change to bob requester
    const res = await contract(betOnRequest("kamala", 2, bob));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).not.toBeNull();
    expect(body.id).not.toBeNull();
    betKamala2Id = body.id;
  });

  test("should find both bets", async () => {
    const res = await contract(betRequest);
    expect(res.status).toBe(200);
    const body : Bet[] = await res.json();
    expect(body).not.toBeNull();
    expect(body.length).toEqual(2);

    expect(body[0].option).toEqual("trump");
    expect(body[0].owner).toEqual(alice);
    expect(body[0].amount).toEqual(1);
    expect(body[0].id).toEqual(betTrump1Id);

    expect(body[1].option).toEqual("kamala");
    expect(body[1].owner).toEqual(bob);
    expect(body[1].amount).toEqual(2);
    expect(body[1].id).toEqual(betKamala2Id);

  });

});
