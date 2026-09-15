export function calculateQuoteTotals(input: {
  quantity: number;
  unitPrice: number;
  labour?: number;
  materials?: number;
  callOutFee?: number;
  travelCharge?: number;
  discount?: number;
  vat?: number;
}) {
  const itemTotal = input.quantity * input.unitPrice;
  const subtotal =
    itemTotal +
    (input.labour || 0) +
    (input.materials || 0) +
    (input.callOutFee || 0) +
    (input.travelCharge || 0) -
    (input.discount || 0);
  const total = subtotal + (input.vat || 0);
  return { itemTotal, subtotal, total };
}

export function nextInvoiceStatus(total: number, paid: number) {
  if (paid <= 0) return "SENT";
  if (paid >= total) return "PAID";
  return "PARTIALLY_PAID";
}
