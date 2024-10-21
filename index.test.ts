
import { JstzHeaders } from '../jstz/packages/sdk';
import contract from './index';
const pingRequest = new Request("tezos://fake/ping");

describe('ping function', () => {
    test('should return Pong', async () => {
        const res = await contract(pingRequest);
        const result = await res.text();
        expect(result).toBe('Pong');
    });
});


const betGETRequest = new Request("tezos://fake/bet");

const reqObject = {
    option: "trump",
    amount: 1
};

const headers: JstzHeaders = { "Content-Type": "application/json" };


const betRequest = new Request(
    "tezos://fake/bet"
    , {
        method: "POST",
        body: JSON.stringify(reqObject),
        headers: headers
    }
);

describe('bet function', () => {

    test('should fail with a GET', async () => {
        const res = await contract(betGETRequest);
        expect(res.status).toBe(500);
    });


    test('should return 200', async () => {
        const res = await contract(betRequest);
        expect(res.status).toBe(200);
    });
});


