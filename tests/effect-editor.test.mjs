import test from 'node:test';
import assert from 'node:assert/strict';
import {configureEffect,effectVariableOptions} from '../scripts/effects.mjs';
test('effect editing opens the native sheet directly and keeps custom variable choices',async()=>{
 let rendered;await configureEffect({sheet:{render:async options=>{rendered=options;}}});
 assert.deepEqual(rendered,{force:true});
 const choices=effectVariableOptions('custom.key');assert.equal(choices['system.health.max'],'Maximum Health');assert.equal(choices['custom.key'],'custom.key');
});
