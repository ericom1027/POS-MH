export const generateSalesInvoiceNumber = () => {
  const currentYear = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${currentYear}-${randomNum}`;
};
