// @vitest-environment jsdom
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { HeaderSlotPortal, HeaderSlotProvider, HeaderSlotTarget } from './index'

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('header slot', () => {
  const host = document.createElement('div')
  const root = createRoot(host)

  afterEach(() => {
    act(() => root.render(createElement(HeaderSlotProvider, null, null)))
  })

  it('renders only into a registered target and follows a replacement target', () => {
    function View({ target }: { target: 'none' | 'first' | 'second' }) {
      return createElement(HeaderSlotProvider, null,
        target !== 'none' ? createElement(HeaderSlotTarget, { key: target, name: 'search', className: target }) : null,
        createElement(HeaderSlotPortal, { name: 'search', children: createElement('span', null, 'Order search') }),
      )
    }

    act(() => root.render(createElement(View, { target: 'none' })))
    expect(host.textContent).toBe('')
    act(() => root.render(createElement(View, { target: 'first' })))
    expect(host.querySelector('.first')?.textContent).toBe('Order search')
    act(() => root.render(createElement(View, { target: 'second' })))
    expect(host.querySelector('.first')).toBeNull()
    expect(host.querySelector('.second')?.textContent).toBe('Order search')
    act(() => root.render(createElement(View, { target: 'none' })))
    expect(host.textContent).toBe('')
  })
})
