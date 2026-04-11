import { MainPopupLayout } from "./layoutVariants/ClassicLayout";

export const popupLayoutVariantMap = {
    "classic": MainPopupLayout
} as const


export type PopupLayoutVariant = keyof typeof popupLayoutVariantMap