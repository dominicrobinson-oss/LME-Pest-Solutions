import { AdminShell, MetricCard } from "@/components/admin-shell";
import { AdminForm, DataTable, Td } from "@/components/data-table";
import { saveBusinessSetting, updateTwoFactorPreference } from "@/app/admin/actions";
import { adminRoles, requireAnyRole } from "@/lib/authz";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default async function SettingsAdminPage() {
  const user = await requireAnyRole(adminRoles);
  const settings = await prisma.businessSetting.findMany({ orderBy: { key: "asc" } });
  const byKey = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
  const requiredKeys = ["business.identity", "business.contact", "business.legal", "operations.hours", "finance.vat", "website.claims", "integrations.providers"];

  return (
    <AdminShell title="Settings" userName={user.name || user.email}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Settings stored" value={String(settings.length)} />
        <MetricCard label="Verified claims enabled" value={byKey["website.claims"] ? "Configured" : "Hidden"} />
        <MetricCard label="Your 2FA" value={user.twoFactorEnabled ? "Enabled" : "Off"} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="card p-5">
          <h3 className="text-xl font-black">Business configuration</h3>
          <DataTable headers={["Key", "Value"]}>
            {settings.map((setting) => (
              <tr key={setting.id}>
                <Td>{setting.key}</Td>
                <Td><pre className="max-w-xl whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs">{formatJson(setting.value)}</pre></Td>
              </tr>
            ))}
          </DataTable>
        </section>

        <div className="grid gap-5">
          <AdminForm title="Save setting">
            <form action={saveBusinessSetting} className="grid gap-3">
              <select className="field" name="key" defaultValue="business.identity">
                {requiredKeys.map((key) => <option key={key}>{key}</option>)}
              </select>
              <textarea className="field min-h-48 font-mono text-xs" name="value" defaultValue={"{\n  \"verified\": false\n}"} />
              <button className="btn-primary" type="submit">Save setting</button>
            </form>
          </AdminForm>

          <AdminForm title="Staff 2FA">
            <form action={updateTwoFactorPreference} className="grid gap-3">
              <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 text-sm">
                <input className="mt-1 size-4" name="enabled" type="checkbox" defaultChecked={user.twoFactorEnabled} />
                <span><b>Email security code</b><br />Require a one-time emailed code when this staff account logs in.</span>
              </label>
              <button className="btn-primary" type="submit">Save 2FA preference</button>
            </form>
          </AdminForm>

          <section className="card p-5">
            <h3 className="text-xl font-black">Recommended keys</h3>
            <div className="mt-3 grid gap-2 text-sm">
              {requiredKeys.map((key) => (
                <div className="rounded-lg bg-slate-50 p-3" key={key}>
                  <b>{key}</b>
                  <p className="text-slate-600">{settings.some((setting) => setting.key === key) ? "Configured" : "Not configured yet"}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
