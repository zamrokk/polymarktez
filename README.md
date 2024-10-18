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

---
together surprise expose pledge shoulder crawl battle hip term toe absorb spice
tz1aoYjbTK7HKAynaE3C4qXGCLmekKZwgF9y
---

jstz account create
jstz bridge deposit --from bootstrap1 --to tz1aoYjbTK7HKAynaE3C4qXGCLmekKZwgF9y --amount 10000000
```

5. call

```
jstz run tezos://tz1Uiua5SyiY6wQQgmKjeHaBn9kEotVCTquY/ --data '{"message":"Please, give me some tez."}'


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
- Host networking is supported on Docker Desktop version 4.34 and later. To enable this feature:
    Sign in to your Docker account in Docker Desktop.
    Navigate to Settings.
    Under the Resources tab, select Network.
    Check the Enable host networking option.
    Select Apply and restart.