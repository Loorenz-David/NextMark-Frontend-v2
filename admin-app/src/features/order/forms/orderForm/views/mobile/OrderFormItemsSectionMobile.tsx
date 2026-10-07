import { ItemFormLayout, ItemFormProvider, ItemsOrderPreview } from "@/features/order/item";
import { PushedPage } from "@/shared/overlays/pushedPage";

import type { OrderFormLayoutModel } from "../../OrderForm.layout.model";

type OrderFormItemsSectionMobileProps = {
  model: OrderFormLayoutModel;
};

/**
 * Items flow with the page instead of scrolling in a fixed box; the item
 * editor opens as a pushed page so the keyboard has the whole screen.
 */
export const OrderFormItemsSectionMobile = ({
  model,
}: OrderFormItemsSectionMobileProps) => {
  const {
    isItemEditorOpen,
    itemEditorPayload,
    closeItemEditor,
    isLoadingInitialItems,
    visibleItemDrafts,
    openItemCreateForm,
    openItemEditForm,
    deleteItem,
  } = model;

  const isEditorOpen = isItemEditorOpen && itemEditorPayload != null;
  const editorTitle =
    itemEditorPayload?.mode === "controlled" && itemEditorPayload.initialItem
      ? "Edit item"
      : "New item";

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-ligth-bg)] shadow-sm">
        {isLoadingInitialItems ? (
          <div className="px-4 py-3 text-sm text-[var(--color-muted)]">
            Loading items...
          </div>
        ) : (
          <ItemsOrderPreview
            controlled={true}
            items={visibleItemDrafts}
            onAddItem={openItemCreateForm}
            onEditItem={openItemEditForm}
            onDeleteItem={(item) => deleteItem(item.client_id)}
          />
        )}
      </section>

      <PushedPage
        open={isEditorOpen}
        onBack={closeItemEditor}
        title={editorTitle}
        backAriaLabel="Close item form"
      >
        {itemEditorPayload ? (
          <>
            <div className="relative min-h-0 flex-1 px-2 pt-3">
              <ItemFormProvider
                payload={itemEditorPayload}
                onSuccessClose={closeItemEditor}
              >
                <ItemFormLayout />
              </ItemFormProvider>
            </div>
            <div className="safe-bottom shrink-0 bg-[var(--color-page)]" />
          </>
        ) : null}
      </PushedPage>
    </>
  );
};
