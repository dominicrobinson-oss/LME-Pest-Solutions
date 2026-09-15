import { env } from "@/lib/env";

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
  emailVerification(url: string) {
    return {
      subject: "Verify your LME Pest Solutions account",
      html: shell("Verify your email", `<p>Confirm this email address for your customer account:</p><p><a href="${url}">${url}</a></p><p>This link expires in 24 hours.</p>`),
      text: `Verify your account: ${url}`,
    };
  },
  customerPortalInvite(url: string) {
    return {
      subject: "Set up your LME Pest Solutions customer portal",
      html: shell("Customer portal access", `<p>Your LME Pest Solutions customer portal is ready. Use this secure link to set your password and review quotes, appointments, invoices and documents.</p><p><a href="${url}">${url}</a></p><p>This link expires in 60 minutes.</p>`),
      text: `Set up your customer portal: ${url}`,
    };
  },
  quoteSent(quoteNumber: string, url: string) {
    return {
      subject: `Quote ${quoteNumber} from LME Pest Solutions`,
      html: shell("Your quote is ready", `<p>Your pest control quote is ready to review.</p><p><a href="${url}">View quote ${quoteNumber}</a></p>`),
      text: `Your quote is ready: ${url}`,
    };
  },
  quoteAccepted(quoteNumber: string) {
    return {
      subject: `Quote ${quoteNumber} accepted`,
      html: shell("Quote accepted", `<p>Quote ${quoteNumber} has been accepted. The office team can now schedule the job.</p>`),
      text: `Quote ${quoteNumber} has been accepted.`,
    };
  },
  invoiceIssued(invoiceNumber: string, url: string, amount: number) {
    return {
      subject: `Invoice ${invoiceNumber} from LME Pest Solutions`,
      html: shell("Invoice issued", `<p>Invoice ${invoiceNumber} is ready.</p><p>Amount due: £${amount.toFixed(2)}</p><p><a href="${url}">View invoice</a></p>`),
      text: `Invoice ${invoiceNumber}: £${amount.toFixed(2)} ${url}`,
    };
  },
  bankPaymentRequested(reference: string, amount: number) {
    return {
      subject: `Bank transfer reference ${reference}`,
      html: shell("Bank transfer requested", `<p>Please use reference <b>${reference}</b> when paying £${amount.toFixed(2)}.</p><p>Account name: ${env.BANK_ACCOUNT_NAME}<br/>Sort code: ${env.BANK_SORT_CODE}<br/>Account number: ${env.BANK_ACCOUNT_NUMBER}</p>`),
      text: `Pay £${amount.toFixed(2)} using reference ${reference}. Account: ${env.BANK_ACCOUNT_NAME}, ${env.BANK_SORT_CODE}, ${env.BANK_ACCOUNT_NUMBER}`,
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
