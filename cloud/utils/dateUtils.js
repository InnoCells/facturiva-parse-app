const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

function getMonthYearString(month, year) {
  if (!month || !year) return null;
  const calculedMonth = month - 1;
  if (calculedMonth == -1) {
    calculedMonth = 12;
  }
  return `${meses[calculedMonth]}, ${year}`;
}

function getStringFromDate(date) {
  if (!date) return null;
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return `${day} de ${meses[month]} de ${year}`;
}

function getMonthNumberFromDate(date) {
  if (!date) return null;
  const monthNum = date.getMonth();
  return monthNum + 1;
}

module.exports = {
  getMonthYearString,
  getStringFromDate,
  getMonthNumberFromDate
};
