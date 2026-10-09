import { ClientFormRedirectRow } from '../components/ClientFormRedirectRow'
import { ClientFormSectionLayout } from '../components/ClientFormSectionLayout'
import {
  MAX_CLIENT_FORM_REDIRECTS,
  useClientFormRedirectsController,
} from '../controllers/useClientFormRedirectsController'

export const ClientFormRedirectPage = () => {
  const { redirects, activeClientId, canCreate, openCreate, openEdit, activate, removeRedirect } =
    useClientFormRedirectsController()

  return (
    <ClientFormSectionLayout
      title="Redirect after submit"
      description="Choose a page customers are sent to after they submit the form sent by email or SMS. They see a 4-second countdown with a button to continue or stay. The in-store device never redirects."
      createLabel="Add page"
      onCreate={canCreate ? openCreate : undefined}
    >
      <div role="radiogroup" aria-label="Redirect after submit" className="flex flex-col gap-3">
        <ClientFormRedirectRow
          redirect={null}
          isActive={activeClientId === null}
          onActivate={activate}
        />
        {redirects.map((redirect) => (
          <ClientFormRedirectRow
            key={redirect.client_id}
            redirect={redirect}
            isActive={redirect.client_id === activeClientId}
            onActivate={activate}
            onEdit={openEdit}
            onDelete={removeRedirect}
          />
        ))}
      </div>

      {!canCreate ? (
        <p className="text-xs text-[var(--color-muted)]/70">
          You can save up to {MAX_CLIENT_FORM_REDIRECTS} pages. Delete one to add another.
        </p>
      ) : null}
    </ClientFormSectionLayout>
  )
}
