import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize,layout,safeUrl,fetchEdition} from '../public/data.js';
const a=(id,slot,extra={})=>({id:String(id),title:'Matéria '+id,slot,...extra});
test('substitui edição e respeita limpeza total',()=>{assert.equal(layout(normalize([a(1,'hero')])).hero.id,'1');assert.equal(layout(normalize([a(2,'hero')])).hero.id,'2');assert.equal(layout(normalize([])).hero,undefined);assert.deepEqual(layout([]).cards,[])});
test('não traz de volta automáticas antigas desposicionadas',()=>{const data=[a(1,'hero'),a(2,'icaro_card_1'),a(3,'',{assignment_mode:'automatic'}),a(4,'',{assignment_mode:'manual'})];assert.deepEqual(layout(normalize(data)).cards.map(x=>x.id),['2','4'])});
test('deduplica ID e posição, aceita objeto articles',()=>{assert.equal(normalize({articles:[a(1,'hero'),a(1,'icaro_card_1'),a(2,'hero')]}).length,1);assert.throws(()=>normalize({error:'x'}))});
test('separa editoria da capa e usa posições explícitas da aviação',()=>{const data=[a(1,'hero'),a(2,'section_hero'),a(3,'icaro_aviation_1')];assert.equal(layout(data).hero.id,'1');assert.equal(layout(data).cards.length,0);assert.equal(layout(data).aviation[0].id,'3')});
test('rejeita links executáveis e dados sem título/ID',()=>{assert.equal(safeUrl('javascript:alert(1)'),'');assert.equal(safeUrl('data:text/html,x'),'');assert.equal(normalize([{id:1,title:''},{id:'x',title:'x'}]).length,0)});
test('GET sem cache e formato validado',async()=>{const old=global.fetch;try{global.fetch=async(url,options)=>{assert.match(url,/domain=revistaicaro.com.br/);assert.equal(options.cache,'no-store');return {ok:true,json:async()=>[a(1,'hero')]}};assert.equal((await fetchEdition())[0].id,'1');global.fetch=async()=>({ok:false,status:404});await assert.rejects(fetchEdition())}finally{global.fetch=old}});

test('automática sem posição nunca vira manchete de reserva',()=>{assert.equal(layout([a(8,'',{assignment_mode:'automatic'})]).hero,undefined)});
