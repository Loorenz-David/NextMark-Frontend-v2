export const ORDER_FORM_HEADER_INFO = [
  {
    title: 'Order operation type',
    content:
      'An order can be pickup, dropoff, or both. These values are shown in order cards and map markers using an up arrow for pickup and a down arrow for dropoff.',
  },
  {
    title: 'How pickup and dropoff are used',
    content:
      'The meaning depends on the workflow. In route planning it can mean the company is picking something up or dropping something off. In store-based flows it can mean a customer is dropping something off or picking something up. In practice these values mainly act as clear labels and filters.',
  },
  {
    title: 'Time windows',
    content:
      'Time windows are flexible business constraints. In route planning they are used for time-violation warnings and route optimization. In store or handoff flows they can represent when something is allowed to happen, such as a customer pickup window or a carrier pickup range.',
  },
  {
    title: 'Items impact',
    content:
      'Items add values such as weight and volume to the order. Their impact depends on the plan type. On routes they affect vehicle load, and in other flows such as international shipping they can contribute to shipment cost.',
  },
]
