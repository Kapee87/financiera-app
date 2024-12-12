/* eslint-disable */
export const truncateDate = (date: Date | string): Date => {
  const parseDate = new Date(date);
  return new Date(
    parseDate.getFullYear(),
    parseDate.getMonth(),
    parseDate.getDate(),
    0,
    0,
    0,
    0,
  );
};
