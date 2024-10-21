const handler = async (request: Request): Promise<Response> => {

    //DEBUG
    console.log("handler", "JSON.stringify(request)");

    // Extract the requester's address and message from the request
    const requester = request.headers.get("Referer") as Address;
    const url = new URL(request.url);
    const path = url.pathname;

    try {
        switch (path) {
            case "/ping":
                console.log("Hello from runner smart function 👋");
                return new Response("Pong");



            case "/bet":
                if (request.method === "POST") {
                    const bet = await request.json();

                    console.log(bet);

                } else {
                    const error = "/bet is a POST request";
                    console.error(error);
                    return new Response(error, { status: 500 });
                }


            default:
                const error = `Unrecognised entrypoint ${path}`;
                console.error(error);
                return new Response(error, { status: 404 });
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
    return new Response("ok");
}

export default handler;
