var f=Symbol.for("@ts-pattern/matcher"),x=Symbol.for("@ts-pattern/isVariadic"),B="@ts-pattern/anonymous-select-key",P=e=>!!(e&&typeof e=="object"),T=e=>e&&!!e[f],l=(e,t,n)=>{if(T(e)){let r=e[f](),{matched:o,selections:i}=r.match(t);return o&&i&&Object.keys(i).forEach(s=>n(s,i[s])),o}if(P(e)){if(!P(t))return!1;if(Array.isArray(e)){if(!Array.isArray(t))return!1;let r=[],o=[],i=[];for(let s of e.keys()){let a=e[s];T(a)&&a[x]?i.push(a):i.length?o.push(a):r.push(a)}if(i.length){if(i.length>1)throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");if(t.length<r.length+o.length)return!1;let s=t.slice(0,r.length),a=o.length===0?[]:t.slice(-o.length),g=t.slice(r.length,o.length===0?1/0:-o.length);return r.every((v,R)=>l(v,s[R],n))&&o.every((v,R)=>l(v,a[R],n))&&(i.length===0||l(i[0],g,n))}return e.length===t.length&&e.every((s,a)=>l(s,t[a],n))}return Reflect.ownKeys(e).every(r=>{let o=e[r];return(r in t||T(i=o)&&i[f]().matcherType==="optional")&&l(o,t[r],n);var i})}return Object.is(t,e)},m=e=>{var t,n,r;return P(e)?T(e)?(t=(n=(r=e[f]()).getSelectionKeys)==null?void 0:n.call(r))!=null?t:[]:Array.isArray(e)?A(e,m):A(Object.values(e),m):[]},A=(e,t)=>e.reduce((n,r)=>n.concat(t(r)),[]);function U(...e){if(e.length===1){let[t]=e;return n=>l(t,n,()=>{})}if(e.length===2){let[t,n]=e;return l(t,n,()=>{})}throw new Error(`isMatching wasn't given the right number of arguments: expected 1 or 2, received ${e.length}.`)}function h(e){return Object.assign(e,{optional:()=>L(e),and:t=>u(e,t),or:t=>j(e,t),select:t=>t===void 0?S(e):S(t,e)})}function M(e){return Object.assign((t=>Object.assign(t,{[Symbol.iterator](){let n=0,r=[{value:Object.assign(t,{[x]:!0}),done:!1},{done:!0,value:void 0}];return{next:()=>{var o;return(o=r[n++])!=null?o:r.at(-1)}}}}))(e),{optional:()=>M(L(e)),select:t=>M(t===void 0?S(e):S(t,e))})}function L(e){return h({[f]:()=>({match:t=>{let n={},r=(o,i)=>{n[o]=i};return t===void 0?(m(e).forEach(o=>r(o,void 0)),{matched:!0,selections:n}):{matched:l(e,t,r),selections:n}},getSelectionKeys:()=>m(e),matcherType:"optional"})})}var $=(e,t)=>{for(let n of e)if(!t(n))return!1;return!0},k=(e,t)=>{for(let[n,r]of e.entries())if(!t(r,n))return!1;return!0};function u(...e){return h({[f]:()=>({match:t=>{let n={},r=(o,i)=>{n[o]=i};return{matched:e.every(o=>l(o,t,r)),selections:n}},getSelectionKeys:()=>A(e,m),matcherType:"and"})})}function j(...e){return h({[f]:()=>({match:t=>{let n={},r=(o,i)=>{n[o]=i};return A(e,m).forEach(o=>r(o,void 0)),{matched:e.some(o=>l(o,t,r)),selections:n}},getSelectionKeys:()=>A(e,m),matcherType:"or"})})}function c(e){return{[f]:()=>({match:t=>({matched:!!e(t)})})}}function S(...e){let t=typeof e[0]=="string"?e[0]:void 0,n=e.length===2?e[1]:typeof e[0]=="string"?void 0:e[0];return h({[f]:()=>({match:r=>{let o={[t??B]:r};return{matched:n===void 0||l(n,r,(i,s)=>{o[i]=s}),selections:o}},getSelectionKeys:()=>[t??B].concat(n===void 0?[]:m(n))})})}function d(e){return typeof e=="number"}function y(e){return typeof e=="string"}function w(e){return typeof e=="bigint"}var W=h(c(function(e){return!0})),z=W,E=e=>Object.assign(h(e),{startsWith:t=>{return E(u(e,(n=t,c(r=>y(r)&&r.startsWith(n)))));var n},endsWith:t=>{return E(u(e,(n=t,c(r=>y(r)&&r.endsWith(n)))));var n},minLength:t=>E(u(e,(n=>c(r=>y(r)&&r.length>=n))(t))),length:t=>E(u(e,(n=>c(r=>y(r)&&r.length===n))(t))),maxLength:t=>E(u(e,(n=>c(r=>y(r)&&r.length<=n))(t))),includes:t=>{return E(u(e,(n=t,c(r=>y(r)&&r.includes(n)))));var n},regex:t=>{return E(u(e,(n=t,c(r=>y(r)&&!!r.match(n)))));var n}}),F=E(c(y)),p=e=>Object.assign(h(e),{between:(t,n)=>p(u(e,((r,o)=>c(i=>d(i)&&r<=i&&o>=i))(t,n))),lt:t=>p(u(e,(n=>c(r=>d(r)&&r<n))(t))),gt:t=>p(u(e,(n=>c(r=>d(r)&&r>n))(t))),lte:t=>p(u(e,(n=>c(r=>d(r)&&r<=n))(t))),gte:t=>p(u(e,(n=>c(r=>d(r)&&r>=n))(t))),int:()=>p(u(e,c(t=>d(t)&&Number.isInteger(t)))),finite:()=>p(u(e,c(t=>d(t)&&Number.isFinite(t)))),positive:()=>p(u(e,c(t=>d(t)&&t>0))),negative:()=>p(u(e,c(t=>d(t)&&t<0)))}),J=p(c(d)),b=e=>Object.assign(h(e),{between:(t,n)=>b(u(e,((r,o)=>c(i=>w(i)&&r<=i&&o>=i))(t,n))),lt:t=>b(u(e,(n=>c(r=>w(r)&&r<n))(t))),gt:t=>b(u(e,(n=>c(r=>w(r)&&r>n))(t))),lte:t=>b(u(e,(n=>c(r=>w(r)&&r<=n))(t))),gte:t=>b(u(e,(n=>c(r=>w(r)&&r>=n))(t))),positive:()=>b(u(e,c(t=>w(t)&&t>0))),negative:()=>b(u(e,c(t=>w(t)&&t<0)))}),_=b(c(w)),C=h(c(function(e){return typeof e=="boolean"})),H=h(c(function(e){return typeof e=="symbol"})),V=h(c(function(e){return e==null})),Q=h(c(function(e){return e!=null})),D={__proto__:null,matcher:f,optional:L,array:function(...e){return M({[f]:()=>({match:t=>{if(!Array.isArray(t))return{matched:!1};if(e.length===0)return{matched:!0};let n=e[0],r={};if(t.length===0)return m(n).forEach(i=>{r[i]=[]}),{matched:!0,selections:r};let o=(i,s)=>{r[i]=(r[i]||[]).concat([s])};return{matched:t.every(i=>l(n,i,o)),selections:r}},getSelectionKeys:()=>e.length===0?[]:m(e[0])})})},set:function(...e){return h({[f]:()=>({match:t=>{if(!(t instanceof Set))return{matched:!1};let n={};if(t.size===0)return{matched:!0,selections:n};if(e.length===0)return{matched:!0};let r=(i,s)=>{n[i]=(n[i]||[]).concat([s])},o=e[0];return{matched:$(t,i=>l(o,i,r)),selections:n}},getSelectionKeys:()=>e.length===0?[]:m(e[0])})})},map:function(...e){return h({[f]:()=>({match:t=>{if(!(t instanceof Map))return{matched:!1};let n={};if(t.size===0)return{matched:!0,selections:n};let r=(a,g)=>{n[a]=(n[a]||[]).concat([g])};if(e.length===0)return{matched:!0};var o;if(e.length===1)throw new Error(`\`P.map\` wasn't given enough arguments. Expected (key, value), received ${(o=e[0])==null?void 0:o.toString()}`);let[i,s]=e;return{matched:k(t,(a,g)=>{let v=l(i,g,r),R=l(s,a,r);return v&&R}),selections:n}},getSelectionKeys:()=>e.length===0?[]:[...m(e[0]),...m(e[1])]})})},intersection:u,union:j,not:function(e){return h({[f]:()=>({match:t=>({matched:!l(e,t,()=>{})}),getSelectionKeys:()=>[],matcherType:"not"})})},when:c,select:S,any:W,_:z,string:F,number:J,bigint:_,boolean:C,symbol:H,nullish:V,nonNullable:Q,instanceOf:function(e){return h(c(function(t){return n=>n instanceof t}(e)))},shape:function(e){return h(c(U(e)))}},N=class extends Error{constructor(t){let n;try{n=JSON.stringify(t)}catch{n=t}super(`Pattern matching error: no pattern matches value ${n}`),this.input=void 0,this.input=t}},O={matched:!1,value:void 0};function G(e){return new K(e,O)}var K=class e{constructor(t,n){this.input=void 0,this.state=void 0,this.input=t,this.state=n}with(...t){if(this.state.matched)return this;let n=t[t.length-1],r=[t[0]],o;t.length===3&&typeof t[1]=="function"?o=t[1]:t.length>2&&r.push(...t.slice(1,t.length-1));let i=!1,s={},a=(v,R)=>{i=!0,s[v]=R},g=!r.some(v=>l(v,this.input,a))||o&&!o(this.input)?O:{matched:!0,value:n(i?B in s?s[B]:s:this.input,this.input)};return new e(this.input,g)}when(t,n){if(this.state.matched)return this;let r=!!t(this.input);return new e(this.input,r?{matched:!0,value:n(this.input,this.input)}:O)}otherwise(t){return this.state.matched?this.state.value:t(this.input)}exhaustive(){if(this.state.matched)return this.state.value;throw new N(this.input)}run(){return this.exhaustive()}returnType(){return this}};var X=(e,t,n,r)=>{if(n<=0){let a="Bet amount must be positive.";return console.error(a),new Response(a,{status:500})}if(n>Ledger.balance(e)){let a="Insufficient balance to place this bet.";return console.error(a),new Response(a,{status:500})}let o=Y(),i={id:o,option:t,amount:n,owner:e},s=Kv.get("BETMAP");return s.set(o,i),console.log(`Bet placed: ${n} on ${t} at odds of ${r}`),Kv.set("BETMAP",s),new Response(JSON.stringify({id:o}))},Z=(e,t,n)=>{let r=Kv.get("ADMIN");if(e!==r){let s="Only the admin "+r+" can give the result.";return console.error(s),new Response(s,{status:403})}let o=Kv.get("RESULT");if(o!=="PENDING"){let s="Result is already given and bets are resolved : "+o;return console.error(s),new Response(s,{status:500})}if(n!=="WIN"&&t!=="DRAW"){let s="Only give winners or draw, no other choices";return console.error(s),new Response(s,{status:500})}return Kv.get("BETMAP").forEach(s=>{let a=Kv.get("FEES");if(n==="WIN"&&s.option===t){let g=s.amount*I(s.option,0);console.log("earnings : "+g+" for "+s.owner),Ledger.transfer(s.owner,g)}else n==="DRAW"?(console.log("give back money : "+s.amount*(1-a)+" for "+s.owner),Ledger.transfer(s.owner,s.amount*(1-a))):console.log("bet lost for "+s.owner)}),Kv.set("RESULT",n),new Response},Y=()=>Math.random().toString(36).substr(2,9),I=(e,t)=>{let n=Kv.get("BETMAP"),r=Kv.get("FEES"),o=Ledger.balance(Ledger.selfAddress),i=Array.from(n.values()).filter(a=>a.option!==e).map(a=>a.amount).reduce((a,g)=>a+g,0)||0;console.log("totalLoserAmount",i);let s=Array.from(n.values()).filter(a=>a.option==e).map(a=>a.amount).reduce((a,g)=>a+g,t||0)||0;return console.log("totalWinnerAmount",s),1+i/s-r},q=async e=>{let t=e.headers.get("Referer"),n=new URL(e.url),r=n.pathname,o=n.searchParams,i=r.replace("/","").split("/");try{return G(i).with(["init"],()=>{if(Kv.has("RESULT")){let s="State already initialized";return console.error(s),new Response(s,{status:500})}else{let s=e.headers.get("Referer");return console.log("Initializing smart function state from admin "+s),Kv.set("FEES",.1),Kv.set("BETMAP",new Map),Kv.set("RESULT","PENDING"),Kv.set("ADMIN",s),new Response}}).with(["ping"],()=>(console.log("Hello from runner smart function \u{1F44B}"),new Response("Pong"))).with(["bet"],async()=>{if(e.method==="POST"){let s=await e.json();return console.log("user",t,"bet",s),X(t,s.option,s.amount,I(s.option,s.amount))}else{if(e.method==="GET")return new Response(JSON.stringify(Array.from(Kv.get("BETMAP").values())));{let s="/bet is a GET or POST request";return console.error(s),new Response(s,{status:500})}}}).with(["bet",D.string],async([,s])=>{if(e.method==="GET")return new Response(JSON.stringify(Array.from(Kv.get("BETMAP").values()).filter(a=>a.id==s)[0]));{let a="/bet is a GET or POST request";return console.error(a),new Response(a,{status:500})}}).with(["result"],async()=>{if(e.method==="POST"){let s=await e.json();return console.log("user",t,"body",s),Z(t,s.option,s.result)}else{if(e.method==="GET")return new Response(JSON.stringify({result:Kv.get("RESULT")}));{let s="/result is a GET or POST request";return console.error(s),new Response(s,{status:500})}}}).with(["odds"],()=>{if(o.size!=2||!o.get("option")||!o.get("amount")||e.method!=="GET"){let s="GET method and option + amount parameters are mandatory";return console.error(s),new Response(s,{status:500})}else return new Response(JSON.stringify({odds:I(o.get("option"),Number(o.get("amount")))}))}).otherwise(()=>{let s=`Unrecognised parsed entrypoint ${i.toString()}`;return console.error(s,i),new Response(s,{status:404})})}catch(s){throw console.error(s),s}return new Response},ae=q;export{ae as default};
