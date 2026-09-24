export const DOMAIN = 'revistaicaro.com.br';
export const SITE_KEY = 'revista-icaro';
export const API = 'https://hub.cm.com.br/api/v1/sites/by-domain/articles?domain=' + DOMAIN;
export const categories = {'destinos':'Destinos','roteiros':'Roteiros','hospedagem':'Hospedagem','sabores':'Sabores','aviacao':'Aviação','guia-do-viajante':'Guia do viajante'};
export function safeUrl(value) { if (!value) return ''; try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
export function normalize(payload) {
  const items = Array.isArray(payload) ? payload : payload?.articles;
  if (!Array.isArray(items)) throw new Error('Formato inválido');
  const ids = new Set(), slots = new Set();
  return items.filter(a => {
    if (!a || !Number.isSafeInteger(Number(a.id)) || Number(a.id) <= 0 || !String(a.title || '').trim()) return false;
    const id = String(a.id), slot = a.slot || a.slot_key;
    if (ids.has(id) || (slot && slots.has(slot))) return false;
    ids.add(id); if (slot) slots.add(slot); return true;
  }).map(a => ({...a, id:String(a.id), slot:a.slot || a.slot_key || '', image_url:safeUrl(a.image_url)}));
}
export async function fetchEdition() {
  const response = await fetch(API + '&refresh=' + Date.now(), {cache:'no-store',headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
  if (!response.ok) throw new Error('Hub indisponível: ' + response.status);
  return normalize(await response.json());
}
export function layout(items) {
  const home = items.filter(a => !a.slot.startsWith('section_'));
  const hero = home.find(a => a.slot === 'hero') || home.find(a => !a.slot && a.assignment_mode === 'manual');
  const briefs = [1,2,3].map(i => home.find(a => a.slot === `icaro_brief_${i}`)).filter(Boolean);
  const aviation = [1,2].map(i => home.find(a => a.slot === `icaro_aviation_${i}`)).filter(Boolean);
  const used = new Set([hero,...briefs,...aviation].filter(Boolean).map(a=>a.id));
  // Only current slotted content, or explicit manual publications without a slot.
  // Detached automatic articles must not return after automatic replacement.
  const cards = home.filter(a => !used.has(a.id) && (a.slot.startsWith('icaro_card_') || (!a.slot && a.assignment_mode === 'manual')))
    .sort((a,b)=>(a.slot || 'z').localeCompare(b.slot || 'z'));
  return {hero,briefs,cards,aviation};
}
export function visibleEdition(items) { return items.filter(a => a.slot || a.assignment_mode === 'manual'); }
