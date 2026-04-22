import type { Item } from '@/features/order/item'
import type { Costumer } from '@/features/costumer'

import type { OrderFormState } from '../state/OrderForm.types'
import {
  executeOrderFormSubmit,
  type OrderFormSubmitCommand,
} from '../controllers/orderFormSubmit.controller'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const okResult = <T>(data: T) => ({
  data,
  warnings: [] as string[],
  status: 200,
})

const buildBaseFormState = (): OrderFormState => ({
  client_id: 'order-client-1',
  order_plan_objective: 'local_delivery',
  operation_type: 'dropoff',
  reference_number: 'REF-100',
  external_source: '',
  external_tracking_number: '',
  external_tracking_link: '',
  tracking_number: '',
  tracking_link: '',
  client_first_name: 'John',
  client_last_name: 'Doe',
  client_email: 'john@doe.com',
  client_primary_phone: { prefix: '+1', number: '3051112233' },
  client_secondary_phone: { prefix: '+1', number: '' },
  client_address: {
    street_address: '123 Main St',
    city: 'Miami',
    country: 'US',
    postal_code: '33101',
    coordinates: { lat: 25.7617, lng: -80.1918 },
  },
  delivery_windows: [],
  delivery_plan_id: 10,
  route_group_id: 77,
  order_note: '',
})

const buildItem = (overrides?: Partial<Item>): Item => ({
  client_id: 'item-client-1',
  article_number: 'A-1',
  item_type: 'box',
  order_id: 200,
  quantity: 1,
  ...overrides,
})

const buildBaseCommand = (): OrderFormSubmitCommand => {
  const formState = buildBaseFormState()

  return {
    mode: 'edit',
    order: { id: 200, client_id: 'order-client-1' },
    orderServerId: 200,
    formState,
    validateForm: () => true,
    initialFormRef: { current: formState },
    itemDraftController: {
      getCreatedItems: () => [],
      getUpdatedItems: () => [],
      getDeletedItems: () => [],
      reset: () => undefined,
    },
    itemInitialByClientId: {},
  }
}

export const runOrderFormSubmitControllerTests = async () => {
  {
    const result = await executeOrderFormSubmit(
      {
        saveOrder: async () => true,
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      buildBaseCommand(),
    )

    assert(result.status === 'no_changes', 'edit mode with no diffs should return no_changes')
  }

  {
    const command = buildBaseCommand()
    command.validateForm = () => false

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async () => true,
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(result.status === 'validation_error', 'invalid form should return validation_error')
  }

  {
    const command = buildBaseCommand()
    command.itemDraftController = {
      ...command.itemDraftController,
      getUpdatedItems: () => [buildItem({ client_id: 'item-updated-1', id: undefined })],
    }

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async () => true,
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(
      result.status === 'dependency_error',
      'missing item id resolution should return dependency_error',
    )
  }

  {
    let saveOrderCalls = 0

    const formState = buildBaseFormState()
    const command: OrderFormSubmitCommand = {
      mode: 'create',
      order: { client_id: 'order-client-1' },
      orderServerId: null,
      formState,
      validateForm: () => true,
      initialFormRef: { current: formState },
      itemDraftController: {
        getCreatedItems: () => [buildItem({ client_id: 'created-item-1' })],
        getUpdatedItems: () => [],
        getDeletedItems: () => [],
        reset: () => undefined,
      },
      itemInitialByClientId: {},
    }

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async ({ onCreateCommitted }) => {
          saveOrderCalls += 1
          onCreateCommitted?.([
            {
              order: {
                id: 100,
                client_id: 'order-client-1',
                order_scalar_id: 5001,
              },
            },
          ])
          return true
        },
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(result.status === 'success_create', 'create submit should return success_create')
    assert(saveOrderCalls === 1, 'create submit should call saveOrder once')
    if (result.status === 'success_create') {
      assert(result.createdOrderScalarId === 5001, 'create submit should capture created order scalar id')
    }
  }

  {
    let createPayload: unknown = null
    const formState = buildBaseFormState()
    const selectedCostumer = { id: 42, client_id: 'costumer-42', first_name: 'Ada', last_name: 'Lovelace' } as Costumer
    const command: OrderFormSubmitCommand = {
      mode: 'create',
      order: { client_id: 'order-client-1' },
      orderServerId: null,
      formState,
      selectedCostumer,
      validateForm: () => true,
      initialFormRef: { current: formState },
      itemDraftController: {
        getCreatedItems: () => [],
        getUpdatedItems: () => [],
        getDeletedItems: () => [],
        reset: () => undefined,
      },
      itemInitialByClientId: {},
    }

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async (params) => {
          createPayload = params.fields
          return true
        },
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(result.status === 'success_create', 'create submit should succeed with selected costumer')
    assert(
      (createPayload as { delivery_plan_id?: number | null })?.delivery_plan_id === 10,
      'create payload should include delivery plan id',
    )
    assert(
      (createPayload as { route_group_id?: number | null })?.route_group_id === 77,
      'create payload should include route group id',
    )
    assert(
      (createPayload as { costumer?: { costumer_id?: number } })?.costumer?.costumer_id === 42,
      'create payload should include selected costumer id',
    )
  }

  {
    let saveOrderCalls = 0

    const initialState = buildBaseFormState()
    const formState = {
      ...initialState,
      tracking_number: 'NEW-TRACKING',
      order_note: { content: 'Legacy note' } as unknown as string,
    }

    const command: OrderFormSubmitCommand = {
      mode: 'edit',
      order: { id: 200, client_id: 'order-client-1' },
      orderServerId: 200,
      formState,
      validateForm: () => true,
      initialFormRef: { current: initialState },
      itemDraftController: {
        getCreatedItems: () => [],
        getUpdatedItems: () => [],
        getDeletedItems: () => [],
        reset: () => undefined,
      },
      itemInitialByClientId: {},
    }

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async () => {
          saveOrderCalls += 1
          return true
        },
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(result.status === 'success_edit', 'legacy note objects should not crash edit submit')
    assert(saveOrderCalls === 1, 'legacy note objects should still allow saveOrder')
  }

  {
    let saveOrderCalls = 0

    const initialState = buildBaseFormState()
    const formState = {
      ...initialState,
      tracking_number: 'NEW-TRACKING',
    }

    const command: OrderFormSubmitCommand = {
      mode: 'edit',
      order: { id: 200, client_id: 'order-client-1' },
      orderServerId: 200,
      formState,
      validateForm: () => true,
      initialFormRef: { current: initialState },
      itemDraftController: {
        getCreatedItems: () => [],
        getUpdatedItems: () => [],
        getDeletedItems: () => [],
        reset: () => undefined,
      },
      itemInitialByClientId: {},
    }

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async () => {
          saveOrderCalls += 1
          return true
        },
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(result.status === 'success_edit', 'edit submit should return success_edit')
    assert(saveOrderCalls === 1, 'edit submit should call saveOrder once')
  }

  {
    let saveOrderCalls = 0
    let editPayload: unknown = null

    const formState = buildBaseFormState()
    const command: OrderFormSubmitCommand = {
      mode: 'edit',
      order: { id: 200, client_id: 'order-client-1', costumer_id: 5 },
      orderServerId: 200,
      formState,
      selectedCostumer: { id: 9, client_id: 'costumer-9', first_name: 'Ari', last_name: 'Stone' } as Costumer,
      validateForm: () => true,
      initialFormRef: { current: formState },
      itemDraftController: {
        getCreatedItems: () => [],
        getUpdatedItems: () => [],
        getDeletedItems: () => [],
        reset: () => undefined,
      },
      itemInitialByClientId: {},
    }

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async (params) => {
          saveOrderCalls += 1
          editPayload = params.fields
          return true
        },
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(result.status === 'success_edit', 'changing only selected costumer should save edit payload')
    assert(saveOrderCalls === 1, 'changing only selected costumer should call saveOrder once')
    assert(
      (editPayload as { costumer?: { costumer_id?: number } })?.costumer?.costumer_id === 9,
      'edit payload should include changed costumer id',
    )
  }

  {
    const formState = buildBaseFormState()
    const command: OrderFormSubmitCommand = {
      mode: 'edit',
      order: { id: 200, client_id: 'order-client-1', costumer_id: 5 },
      orderServerId: 200,
      formState,
      selectedCostumer: { id: 5, client_id: 'costumer-5', first_name: 'Same', last_name: 'Costumer' } as Costumer,
      validateForm: () => true,
      initialFormRef: { current: formState },
      itemDraftController: {
        getCreatedItems: () => [],
        getUpdatedItems: () => [],
        getDeletedItems: () => [],
        reset: () => undefined,
      },
      itemInitialByClientId: {},
    }

    const result = await executeOrderFormSubmit(
      {
        saveOrder: async () => true,
        createItemApi: async () => okResult({} as never),
        updateItemApi: async () => okResult({} as never),
        deleteItemApi: async () => okResult({} as never),
        loadItemsByOrderId: async () => null,
        validateOrderFields: () => true,
      },
      command,
    )

    assert(
      result.status === 'no_changes',
      'edit mode with unchanged selected costumer and no field/item diffs should return no_changes',
    )
  }
}
