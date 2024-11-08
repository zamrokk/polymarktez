# CICD

There plenty of CICD tools on the market to build pipelines

Here is an example of one using the Github config files

1. create a Github pipeline 

    ```bash
    mkdir /github
    mkdir /github/workflows
    touch /github/workflows/polymarktez.yml
    ```

1. Edit the file to include a CI / CD pipeline

    ```yml
    name: CI
    on: push
    jobs: 
      build: 
        runs-on: ubuntu-latest
        steps: 
        - name: Check out repository code
            uses: actions/checkout@v3
        - name: Use node
            uses: actions/setup-node@v4
            with:
            node-version: 18
        - run: npm ci
        - run: npm run build    
      test: 
        needs: build
        runs-on: ubuntu-latest
        steps: 
            - name: Check out repository code
            uses: actions/checkout@v3
            - name: Use node 
            uses: actions/setup-node@v4
            with:
                node-version: 18
            - run: npm ci   
            - run: npm test
      deploy:
        needs: test
        runs-on: ubuntu-latest
        environment:
          name: testnet
          url: ${{ steps.deployment.outputs.contractId }}
        steps: 
            - name: Check out repository code
            uses: actions/checkout@v3
            - name: Use node 
            uses: actions/setup-node@v4
            with:
                node-version: 18
            - run: npm ci   
            - run: npm run build_chunk
            - name: deploy
            id: deployment
            uses: nomadic-labs/tezosX-deploy@v0.0.1
            with:
                sk: ${{ secrets.SK }}
                user: ${{ env.PKH }}
                file: dist/chunk/index.js
                rpc: ${{ env.TEZOSX_URL }}
                balance: 0
                gas-limit: 1000000
                name: polymarktez
                runtime: jstz
                instances: 2
                memory: 256M
                cpu: standard-1
                region: eu
    ```

1. There a 3 steps : 
    - Build the original code
    - Run the tests
    - FIXME : Deploy the proxy contract. The `tezosX-deploy` plugin does not exist yet and would be more complex as it will have to manage the upload of the chunks. It will leverage jstz CLI. Also the target PaaS platform, **Tezos X**, does not exist yet so we cannot guess all later required parameters.