# polymarktez (https://polymarket.com/event/presidential-election-winner-2024?tid=1729240808851)

1. create main.ts
2. create package.json and tsconfig.json
3. compile

```
npm install
npm run build
```

4. deploy

```
jstz deploy dist/index.js -n dev

---
wall side also print camera hour cheese chimney material subject cry perfect
tz1eVqP1XNL9SCrrgkXgV5ZcteSULwiykDZ8
---

jstz account create
jstz bridge deposit --from bootstrap1 --to tz1eVqP1XNL9SCrrgkXgV5ZcteSULwiykDZ8 --amount 100
more ~/.jstz/config.json
```

//second account
 random2
Generated passphrase: fatal either coach hidden young apart frost believe sphere shuffle earn hidden
User created with address: tz1V6x4YzgxAvLnhZsZa7NQdW2BZaoRN2iyk

5. call

```
jstz run tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/ping -n dev
jstz run tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/init -n dev

```

6. Test

To deploy and run, execute:

```sh
npm run test
```

## frontend

```
deno run -A npm:create-vite@latest
```

compile , then import jstz library

```
npm i  @jstz-dev/sdk@file:../../jstz/packages/sdk


import { Jstz, User } from "@jstz-dev/sdk";
```

## notes

- 11/10/2024 : installing NPM on Ubuntu 24.04.1 LTS . npm -v => 9.2.0 . On doc it says : npm (>= 9.6.7)
- controller, it would be great to have something siimilar to nestjs annotations => less code, better readibility : https://docs.nestjs.com/controllers#routing
- how to login with wallet ?
- just simple example from scratch with default mandatory stuff ? (typing deps, vite config deps, etc ...)
- improve npm package publication because it is not on npm repo and not possible with a git link too. Need to compile and do a relative path, rn (i.e install nix and build it)
  `alias jstz='docker run --rm -v "/tmp:/tmp" -v "$HOME/.jstz:/root/.jstz" -v "$PWD:$PWD" -w "$PWD" --network host -it ghcr.io/jstz-dev/jstz/jstz-cli:20241007'`
- kill the config file if error : `rm -rf ~/.jstz/config.json`
- problem with mnemonic and accounts
- Host networking is supported on Docker Desktop version 4.34 and later. To enable this feature:
  Sign in to your Docker account in Docker Desktop.
  Navigate to Settings.
  Under the Resources tab, select Network.
  Check the Enable host networking option.
  Select Apply and restart.
- jstz logs trace : cannot exit with ctrl+C or D

# CHUNK version for buil / deployment

1. build the code to test it is building fine

```
npm install
npm run build
```

2. (manually) cut your code in chunks < 4Ko

3. build the "interface" contract that will be the one you deploy

```
npm run build_chunkstorage_version
```

4. Start sandbox and deploy the "interface" contract

```
jstz sandbox start
jstz deploy dist/chunkstorage_version/index.js -n dev -b 3  
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/ping" -n dev -t
```

5. (optional) send money to your buddy

```
jstz bridge deposit --from bootstrap1 --to tz1eVqP1XNL9SCrrgkXgV5ZcteSULwiykDZ8 --amount 100 -n dev
```

6. Init, then we need to generate the chunks and send the chunks

```

npm run chunk

jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/init" -n dev -t
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/code" -n dev -t

jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-1.txt)
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-2.txt)
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-3.txt)
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-4.txt)
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d $(< ./dist/part-5.txt)
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/chunk" -n dev -t -r POST -d ""

jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/code" -n dev -t




```

7. try a real call


```
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/bet" -n dev -t 
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/bet" -n dev -t -r POST -d '{"option":"trump","amount":1}'
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/odds?option=trump&amount=1" -n dev -t 

jstz login random2

jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/bet" -n dev -t -r POST -d '{"option":"harris","amount":2}'
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/bet" -n dev -t 
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/odds?option=trump&amount=1" -n dev -t 
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/odds?option=harris&amount=1" -n dev -t 

jstz login random
jstz run "tezos://tz1RmHeyX8HPpum8xz7upvcqsrKyf1A5d85p/result" -n dev -t -r POST -d '{"option":"trump","result":"WIN"}'


```
