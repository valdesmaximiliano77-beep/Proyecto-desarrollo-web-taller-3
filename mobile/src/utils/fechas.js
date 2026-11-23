// El backend entrega fechas como "AAAA-MM-DD". Se interpretan en hora local
// (new Date("2026-11-02") las correría un día por la zona horaria).
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const dos = (n) => String(n).padStart(2, '0');

export function parseFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function hoyISO() {
  const h = new Date();
  return `${h.getFullYear()}-${dos(h.getMonth() + 1)}-${dos(h.getDate())}`;
}

export function diasHasta(iso) {
  return Math.round((parseFecha(iso) - parseFecha(hoyISO())) / 86400000);
}

export function etiquetaRelativa(iso) {
  const n = diasHasta(iso);
  if (n === 0) return 'Hoy';
  if (n === 1) return 'Mañana';
  if (n === -1) return 'Ayer';
  if (n < 0) return `Hace ${-n} días`;
  return `En ${n} días`;
}

// "lunes 2 de noviembre"
export function fechaLarga(iso) {
  const f = parseFecha(iso);
  return `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`;
}

// "2 nov"
export function fechaCorta(iso) {
  const f = parseFecha(iso);
  return `${f.getDate()} ${MESES[f.getMonth()].slice(0, 3)}`;
}
