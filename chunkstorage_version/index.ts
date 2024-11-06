import { Bet, BET_RESULT, KEYS } from "../index.types";

export enum BOOT_MODE {
  CHUNKING = "CHUNKING",
  BOOTED = "BOOTED",
}

const init = async (request: Request) => {
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
    Kv.set(KEYS.BOOT_MODE, BOOT_MODE.CHUNKING);
    return new Response();
  }
};

const run = async (request: Request): Promise<Response> => {
  console.log("Calling run with request " + request);
  const code: string = await Kv.get(KEYS.CODE)!;
  const module = eval(code);
  console.log("module", module);
  const handler = module.default;
  return await handler(request);
};

const chunker = async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname !== "/chunk" && request.method !== "POST") {
    return new Response("Not found", { status: 404 });
  }

  // assert POST /chunk
  const body = await request.text();

  if (!body || body.trim() === "") {
    console.log("last call to end the uploads");
    Kv.set(KEYS.BOOT_MODE, BOOT_MODE.BOOTED);

    try{
      Kv.set(KEYS.CODE, atob(Kv.get(KEYS.CODE) || "")); //decode base64
    }catch(e){
      console.warn("atob failed, trying with Buffer ...",e)
      try {
        Kv.set(KEYS.CODE, Buffer.from(Kv.get<string>(KEYS.CODE)!,"base64url").toString()); //decode base64
      } catch (error) {
        console.log("Impossible to decode64url even with Buffer",error);
        throw e;
      }
    }
  } else {
    console.log("continue to receive chunks ...");
    const code = Kv.get(KEYS.CODE) || "";
    Kv.set(KEYS.CODE, code + body);
  }
};

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname;

  //FIXME : ping
  if (path === "/ping") {
    console.log("Hello from runner smart function 👋");
    return new Response("Pong");
  }

  //FIXME HACK : init KV storage and return
  if (path === "/init") return await init(request);

  //FIXME HACK : init KV storage and return
  if (path === "/code") return new Response(await Kv.get(KEYS.CODE));

  const mode = Kv.get<BOOT_MODE>(KEYS.BOOT_MODE) || BOOT_MODE.CHUNKING;
  console.log("mode", mode);

  if (mode === BOOT_MODE.CHUNKING) {
    await chunker(request);
    return new Response();
  } else if (mode === BOOT_MODE.BOOTED) {
    return await run(request);
  }

  throw new Error("Unknown boot mode");
};

export default handler;
