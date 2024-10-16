# polymarktez

1. create main.ts
2. create package.json and tsconfig.json
3. compile

```
npm install
npm run build
```

4. deploy

```
jstz deploy dist/index.js




jstz account create
jstz bridge deposit --from bootstrap1 --to tz1dA4FHF1Yv5tneZAAMFGtmt1vyJdELhjcd --amount 10000000
```

5. call

```
jstz run tezos://tz1gpuyvBotqNRQoPPstGmzAWLG4eomTyBL8/ --data '{"message":"Please, give me some tez."}'


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
- pass grammarly on the .md documentation ! ex : recieved
- controller, it would be great to have something siimilar to nestjs annotations => less code, better readibility : https://docs.nestjs.com/controllers#routing
- how to login with wallet ?
- just simple example from scratch with default mandatory stuff ? (typing deps, vite config deps, etc ...)
- improve npm package publication because it is not on npm repo and not possible with a git link too. Need to compile and do a relative path, rn (i.e install nix and build it)
- problem with mnemonic and accounts