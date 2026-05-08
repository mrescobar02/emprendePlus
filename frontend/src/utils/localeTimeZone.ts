export function getPanamaISOString(): string {
  const now = new Date();

  // Obtener componentes de fecha y hora en hora local UTC-5
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const panamaTime = new Date(utc + -5 * 60 * 60000); // UTC-5

  // Extraer los componentes manualmente para formato ISO
  const yyyy = panamaTime.getFullYear();
  const mm = String(panamaTime.getMonth() + 1).padStart(2, '0');
  const dd = String(panamaTime.getDate()).padStart(2, '0');
  const hh = String(panamaTime.getHours()).padStart(2, '0');
  const mi = String(panamaTime.getMinutes()).padStart(2, '0');
  const ss = String(panamaTime.getSeconds()).padStart(2, '0');
  const ms = String(panamaTime.getMilliseconds()).padStart(3, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.${ms}-05:00`;
}
export function getPanamaDayAndHour(isoDate: string) {
  const date = new Date(isoDate);

  const panamaDate = new Date(
    date.getTime() - (date.getTimezoneOffset() + 5 * 60) * 60000
  );

  const dayIndex = panamaDate.getDay();
  const hour = panamaDate.getHours();

  return { day: dayIndex, hour };
}