import {cpSync,mkdirSync,rmSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist');cpSync('public','dist',{recursive:true});
console.log('Site pronto em dist/');
