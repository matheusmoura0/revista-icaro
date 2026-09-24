import {fetchEdition, layout, visibleEdition} from './data.js';
import {el, categoryLabel, articleUrl, plain, picture, menu, analytics} from './shared.js';
let items=[], selected=new URLSearchParams(location.search).get('editoria') || 'Todas', busy=false;
const status=document.getElementById('status'),retry=document.getElementById('retry');
function card(a){const root=el('article','','card'+(a.image_url?' has-image':'')),link=el('a');link.href=articleUrl(a);const img=picture(a);if(img)link.append(img);link.append(el('span',categoryLabel(a),'kicker'),el('h3',a.title),el('p',plain(a.description)),el('span',a.author||a.publisher||'','meta'));root.append(link);return root;}
function render(){
 const edition=layout(items),filtered=selected==='Todas'?edition.cards:visibleEdition(items).filter(a=>categoryLabel(a)===selected);
 document.getElementById('section-title').textContent=selected==='Todas'?'Inspiração para partir':selected;
 document.getElementById('result-count').textContent=filtered.length+' matérias';
 const grid=document.getElementById('articles');grid.replaceChildren(...filtered.map(card));
 if(!filtered.length)grid.append(el('p',selected==='Todas'?'Novas histórias serão publicadas em breve.':'Nenhuma matéria publicada nesta editoria.','empty'));
 const cover=document.getElementById('cover');cover.hidden=selected!=='Todas'||!edition.hero;
 const hero=document.getElementById('hero');hero.replaceChildren();
 if(edition.hero){const a=edition.hero;hero.classList.toggle('no-image',!a.image_url);const img=picture(a);if(img){img.loading='eager';const fig=el('figure');fig.append(img);if(a.image_credit)fig.append(el('figcaption',a.image_credit));hero.append(fig)}const body=el('div','','hero-copy'),h=el('h1'),link=el('a',a.title);link.href=articleUrl(a);h.append(link);const cta=el('a','Ler matéria ↗','text-button');cta.href=articleUrl(a);body.append(el('span',categoryLabel(a),'kicker'),h,el('p',plain(a.description)),cta);hero.append(body)}
 const briefs=document.getElementById('briefs');briefs.replaceChildren(...edition.briefs.map((a,i)=>{const link=el('a');link.href=articleUrl(a);link.append(el('span',String(i+1).padStart(2,'0'),'num'),el('b',a.title));return link}));briefs.hidden=!edition.briefs.length;
 document.getElementById('aviation').hidden=selected!=='Todas'||!edition.aviation.length;
 document.getElementById('aviation-links').replaceChildren(...edition.aviation.map(a=>{const link=el('a',a.title);link.href=articleUrl(a);return link}));
 document.querySelectorAll('#nav button').forEach(b=>{b.removeAttribute('aria-current');if(b.dataset.category===selected)b.setAttribute('aria-current','page')});
}
async function refresh(){if(busy)return;busy=true;try{items=await fetchEdition();render();status.textContent=items.length?'':'A próxima edição está sendo preparada.';status.hidden=items.length>0;retry.hidden=true}catch{status.hidden=false;status.textContent=items.length?'Não foi possível atualizar agora. Exibindo a última edição carregada.':'Não foi possível carregar a edição. Tente novamente.';retry.hidden=false}finally{busy=false}}
menu(category=>{selected=category;const url=new URL(location.href);if(category==='Todas')url.searchParams.delete('editoria');else url.searchParams.set('editoria',category);history.replaceState(null,'',url);render()});
retry.addEventListener('click',refresh);refresh();analytics();setInterval(()=>{if(document.visibilityState==='visible')refresh()},60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
