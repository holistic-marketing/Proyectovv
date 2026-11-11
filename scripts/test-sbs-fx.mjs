import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(fetch) {
  const code = ts.transpileModule(fs.readFileSync('lib/payments/fx-rate.server.ts','utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = {exports:{}};
  const env = {fxRateSource:'manual', holisticUsdPenRate:3.37, holisticUsdPenMin:3, holisticUsdPenMax:4.5, holisticUsdPenSpread:0.1};
  vm.runInNewContext('(function(require,module,exports){'+code+'\n})',
    {fetch, Date, AbortController, setTimeout, clearTimeout, console})
    (id => id === 'server-only' ? {} : {serverEnv:env},module,module.exports);
  return module.exports;
}
function period(daysAgo=0) {
  const d=new Date(); d.setUTCDate(d.getUTCDate()-daysAgo);
  return `${d.getUTCDate()}.${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'][d.getUTCMonth()]}.${String(d.getUTCFullYear()).slice(2)}`;
}
const response = periods => ({ok:true,text:async()=>JSON.stringify({periods})});

test('uses last published SBS sell rate, ignoring legacy manual configuration and spread', async()=>{
  let calls=0;
  const fx=load(async()=>{calls++;return response([{name:period(1),values:['3.418']},{name:period(),values:['n.d.']}]);});
  const quote=await fx.resolveHolisticUsdPenRate();
  assert.equal(quote.usdPen,3.418); assert.equal(quote.source,'sbs'); assert.ok(quote.asOf);
  assert.equal(fx.getHolisticUsdPenRateSync(),3.418);
  await fx.resolveHolisticUsdPenRate(); assert.equal(calls,1);
});
test('outage never falls back to 3.37 and a later successful request can recover', async()=>{
  let fail=true;
  const fx=load(async()=>fail ? {ok:false,status:503} : response([{name:period(),values:['3.42']}]));
  assert.throws(()=>fx.getHolisticUsdPenRateSync(),/SBS/);
  await assert.rejects(fx.resolveHolisticUsdPenRate(),/SBS/);
  fail=false; assert.equal((await fx.resolveHolisticUsdPenRate()).usdPen,3.42);
});
test('rejects stale, malformed, out-of-range and future official data', async()=>{
  for(const row of [
    {name:period(20),values:['3.4']}, {name:'invalid',values:['3.4']},
    {name:period(),values:['3.4garbage']}, {name:period(),values:['8']},
    {name:period(-3),values:['3.4']},
  ]) await assert.rejects(load(async()=>response([row])).resolveHolisticUsdPenRate(),/SBS/);
});
