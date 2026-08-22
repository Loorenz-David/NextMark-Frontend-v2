/**
 * The real `document.head` behind `ManagedHeadPort`.
 *
 * Every element it creates carries `MANAGED_HEAD_ATTRIBUTE`, and every read is
 * scoped by that attribute — which is what keeps the reconciler from ever
 * removing a tag the build shipped in `index.html`.
 */

import {
  MANAGED_HEAD_ATTRIBUTE,
  type ManagedHeadPort,
  type ManagedHeadRecord,
  type ManagedHeadTag,
} from '../domain/managedHead'

const readAttributes = (element: Element): Record<string, string> => {
  const attributes: Record<string, string> = {}
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.name === MANAGED_HEAD_ATTRIBUTE) continue
    attributes[attribute.name] = attribute.value
  }
  return attributes
}

export const createDocumentHeadPort = (
  documentRef: Document = document,
): ManagedHeadPort => {
  const find = (key: string) =>
    documentRef.head.querySelector(`[${MANAGED_HEAD_ATTRIBUTE}="${key}"]`)

  return {
    list: (): readonly ManagedHeadRecord[] =>
      Array.from(
        documentRef.head.querySelectorAll(`[${MANAGED_HEAD_ATTRIBUTE}]`),
      ).map((element) => ({
        key: element.getAttribute(MANAGED_HEAD_ATTRIBUTE) ?? '',
        tagName: element.tagName.toLowerCase(),
        attributes: readAttributes(element),
      })),

    create: (tag: ManagedHeadTag) => {
      const element = documentRef.createElement(tag.tagName)
      element.setAttribute(MANAGED_HEAD_ATTRIBUTE, tag.key)
      for (const [name, value] of Object.entries(tag.attributes)) {
        element.setAttribute(name, value)
      }
      documentRef.head.appendChild(element)
    },

    update: (key: string, attributes: Readonly<Record<string, string>>) => {
      const element = find(key)
      if (!element) return
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name === MANAGED_HEAD_ATTRIBUTE) continue
        if (!(attribute.name in attributes)) {
          element.removeAttribute(attribute.name)
        }
      }
      for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value)
      }
    },

    remove: (key: string) => {
      find(key)?.remove()
    },

    getTitle: () => documentRef.title,
    setTitle: (title: string) => {
      documentRef.title = title
    },
  }
}
