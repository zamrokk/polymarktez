
//******************* THE CHUNKER !
import * as vm from 'vm';
export const KEYS_CODE = "KEYS_CODE";

const handler = async (request: Request): Promise<Response> => {

    const callContractCode = async (request: Request): Promise<Response> => {
        const code: string = Kv.get(KEYS_CODE)!;

        const module = new vm.SourceTextModule(code, {
            identifier: "polymarktez", context: vm.createContext({
                globalThis, console,
                setTimeout,
                Promise,
                URL,  // Add URL to context
                process, // Needed for URL resolution
                Buffer,   // Might be needed for URL operations
                URLSearchParams: globalThis.URLSearchParams,
                Kv: globalThis.Kv,
                Response: globalThis.Response,
                Ledger: globalThis.Ledger
            })
        });
        await module.link(() => {
            throw new Error('Module linking not supported');
        });
        await module.evaluate();
        const defaultExport = (module.namespace as { default: (a: any) => any }).default;
        // Verify it's a function
        if (typeof defaultExport !== 'function') {
            throw new Error('Default export must be a function');
        }
        return await defaultExport(request);
    }

    try {
        const res = await callContractCode(request)
        console.log("************* after callContractCode call", res)
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }

}

export default handler;
