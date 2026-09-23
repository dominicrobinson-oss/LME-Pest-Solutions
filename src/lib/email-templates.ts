function shell(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5"><h1>${title}</h1>${body}<p style="margin-top:24px">LME Pest Solutions</p></div>`;
}

export const emailTemplates = {
  passwordReset(url: string) {
    return {
      subject: "Reset your LME Pest Solutions password",
      html: shell("Reset your password", `<p>Use this secure link to reset your password:</p><p><a href="${url}">${url}</a></p><p>This link expires in 60 minutes.</p>`),
      text: `Reset your password: ${url}`,
    };
  },
  staffInvite(url: string) {
    return {
      subject: "You've been invited to LME Operations",
      html: shell("Set up your staff account", `<p>You've been invited to the LME Pest Solutions admin panel. Use this secure link to set your password and sign in.</p><p><a href="${url}">${url}</a></p><p>This link expires in 7 days.</p>`),
      text: `Set up your staff account: ${url}`,
    };
  },
  quoteSent(quoteNumber: string) {
    return {
      subject: `Quote ${quoteNumber} from LME Pest Solutions`,
      html: shell("Your quote is ready", `<p>Your pest control quote ${quoteNumber} is ready. Our team will be in touch, or you can call us with any questions.</p>`),
      text: `Your quote ${quoteNumber} is ready. Our team will be in touch, or you can call us with any questions.`,
    };
  },
  quoteAccepted(quoteNumber: string) {
    return {
      subject: `Quote ${quoteNumber} accepted`,
      html: shell("Quote accepted", `<p>Quote ${quoteNumber} has been accepted. The office team can now schedule the job.</p>`),
      text: `Quote ${quoteNumber} has been accepted.`,
    };
  },
  invoiceIssued(invoiceNumber: string, amount: number) {
    return {
      subject: `Invoice ${invoiceNumber} from LME Pest Solutions`,
      html: shell("Invoice issued", `<p>Invoice ${invoiceNumber} is ready.</p><p>Amount due: £${amount.toFixed(2)}</p><p>Please get in touch to arrange payment.</p>`),
      text: `Invoice ${invoiceNumber}: £${amount.toFixed(2)} due. Please get in touch to arrange payment.`,
    };
  },
  jobReminder(jobNumber: string, dateText: string) {
    return {
      subject: `Reminder: LME appointment ${jobNumber}`,
      html: shell("Appointment reminder", `<p>Your pest control appointment ${jobNumber} is scheduled for ${dateText}.</p>`),
      text: `Appointment ${jobNumber} is scheduled for ${dateText}.`,
    };
  },
};
