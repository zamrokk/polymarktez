# Deploy to local sandbox

> Note : Jstz CLI use Docker. Check that the feature `Host Networking` is activated on Docker desktop to allow network communication

1. Start the local sandbox network

    ```bash
    jstz sandbox start
    ```

1. Create a user on the network and keep check data

    ```bash
    jstz account create
    more ~/.jstz/config.json
    ```

1. Send money to this user

    ```bash
    jstz bridge deposit --from bootstrap1 --to tz1eVqP1XNL9SCrrgkXgV5ZcteSULwiykDZ8 --amount 100 -n dev
    ```

1. Deploy the proxy contract
    > Note : (Optional) -b argument send some money on the contract so you can validate test scenarios later 

    ```bash
    jstz deploy dist/chunk/index.js -n dev -b 3  
    ```

1. Copy the contract address and keep it

1. Ping the proxy to see if it is alive, it should return `200 Pong`

    ```bash
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/ping" -n dev -t
    ```

1. Initialize the KV storage

    ```bash
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/init" -n dev -t
    ```

1. If you run the chunk script before, you should have already the chunk files ready to upload. Upload it all

    ```bash
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-1.txt)
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-2.txt)
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-3.txt)
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d ""
    ```

1. Check that is code has been correctly uploaded and decoded

    ```bash
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/code" -n dev -t
    ```

1. Test your endpoints

    ```bash
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/bet" -n dev -t 
    jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/bet" -n dev -t -r POST -d '{"option":"trump","amount":1}'
    ```

1. Check that both requests passed with `200` http code status