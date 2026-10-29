import { useSession, useSignOutEverywhere } from "../../hooks/useSession";
import { ChangeEmailForm } from "../account/ChangeEmailForm";
import { ChangePasswordForm } from "../account/ChangePasswordForm";
import { DeleteAccount } from "../account/DeleteAccount";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { PageHeader } from "../ui/PageHeader";
import { SectionTitle } from "../ui/SectionTitle";

/** Your details, password, devices and deleting the account (KES-43). */
export function AccountView() {
  const user = useSession().data;
  const signOutEverywhere = useSignOutEverywhere();

  return (
    <section>
      <PageHeader title="Account" subtitle="Your details, password and devices" />

      <SectionTitle>Your details</SectionTitle>
      <Card>
        <dl className="m-0 py-1.5">
          <div className="flex justify-between gap-3 border-b border-line py-2">
            <dt className="text-muted">Name</dt>
            <dd className="m-0 font-semibold">{user?.name}</dd>
          </div>
          <div className="flex justify-between gap-3 py-2">
            <dt className="text-muted">Email</dt>
            <dd className="m-0 font-semibold break-all">{user?.email}</dd>
          </div>
        </dl>
        <ChangeEmailForm />
      </Card>

      <SectionTitle>Change password</SectionTitle>
      <Card>
        <ChangePasswordForm />
      </Card>

      <SectionTitle>Devices</SectionTitle>
      <Card>
        <div className="py-3.5">
          <p className="m-0">
            Signed in on a phone or computer you no longer use? Sign out everywhere, then sign in
            again here.
          </p>
          <p role="status" className="m-0 min-h-[1lh] text-sm font-semibold text-error">
            {signOutEverywhere.isError &&
              "We couldn't reach Kestlow. Please try again in a minute."}
          </p>
          <Button
            variant="ghost"
            disabled={signOutEverywhere.isPending}
            onClick={() => signOutEverywhere.mutate()}
            className="w-full"
          >
            {signOutEverywhere.isPending ? "Signing out…" : "Sign out of all devices"}
          </Button>
        </div>
      </Card>

      <SectionTitle>Delete account</SectionTitle>
      <Card>
        <DeleteAccount />
      </Card>
    </section>
  );
}
