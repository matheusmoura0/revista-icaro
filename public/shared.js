import {categories, safeUrl, DOMAIN, SITE_KEY} from './data.js';
export function el(tag,text='',className='') { const n=document.createElement(tag);n.textContent=text;n.className=className;return n; }
export const categoryLabel = a => categories[a.category] || 'Viagens e turismo';
export const articleUrl = a => 'materia.html?id=' + encodeURIComponent(a.id);
export function plain(value) { return new DOMParser().parseFromString(String(value || ''),'text/html').body.textContent || ''; }
export function picture(a) { if(!a.image_url) return null;const img=el('img');img.src=a.image_url;img.alt=plain(a.title);img.loading='lazy';img.style.objectPosition=`${Math.min(100,Math.max(0,Number(a.image_focus_x)||50))}% ${Math.min(100,Math.max(0,Number(a.image_focus_y)||50))}%`;img.addEventListener('error',()=>img.remove(),{once:true});return img; }
export function credit(a) {const p=el('p','','credit');const url=safeUrl(a.source_url);const text=a.credit || (a.publisher ? 'Publicado originalmente por '+a.publisher : 'Fonte original');if(url){const link=el('a',text);link.href=url;link.rel='noopener';p.append(link)}else p.textContent=text;return p;}
export function analytics(article) {
  if (![DOMAIN,'www.'+DOMAIN].includes(location.hostname) || document.getElementById('cm-tracker')) return;
  const s=document.createElement('script');s.id='cm-tracker';s.src='https://hub.cm.com.br/cm-analytics.js';s.dataset.site=SITE_KEY;s.defer=true;
  if(article){s.dataset.articleId=article.id;s.dataset.category=categoryLabel(article);s.dataset.author=article.author||''}document.head.append(s);
}
export function menu(onCategory) {
  const nav=document.getElementById('nav'),toggle=document.querySelector('.menu');
  toggle.addEventListener('click',()=>{toggle.setAttribute('aria-expanded',String(nav.classList.toggle('open')))});
  nav.addEventListener('click',event=>{const b=event.target.closest('[data-category]');if(!b)return;nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');onCategory(b.dataset.category)});
}
// Preserve basic editorial formatting, never execute arbitrary Hub markup.
export function contentFragment(html) {
  const parsed = new DOMParser().parseFromString(String(html||''),'text/html');
  const allowed=new Set(['P','BR','STRONG','B','EM','I','H2','H3','UL','OL','LI','BLOCKQUOTE','A']);
  const blocked=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','SVG','MATH','TEMPLATE']);
  function copy(node) {
    if(node.nodeType===3)return document.createTextNode(node.textContent);
    if(node.nodeType!==1 || blocked.has(node.tagName))return document.createDocumentFragment();
    const result=allowed.has(node.tagName)?document.createElement(node.tagName.toLowerCase()):document.createDocumentFragment();
    if(node.tagName==='A'){const url=safeUrl(node.getAttribute('href'));if(url){result.href=url;result.rel='noopener noreferrer'}}
    for(const child of node.childNodes)result.append(copy(child));return result;
  }
  const fragment=document.createDocumentFragment();for(const child of parsed.body.childNodes)fragment.append(copy(child));return fragment;
}
