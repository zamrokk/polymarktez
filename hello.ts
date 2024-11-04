//******************* functions

const handler = async (request: Request): Promise<Response> => {
  //DEBUG
  console.debug("handler request", request);

  return new Response();
};

export default handler;
