export const LOCAL_DELIVERY_ORDER_SERVICE_TIME_INFO = {
  title: 'Service time per order',
  content:
    'Adds a fixed number of minutes to every stop. This represents the base time needed once the driver arrives, before item-based time is added.',
}

export const LOCAL_DELIVERY_PER_ITEM_SERVICE_TIME_INFO = {
  title: 'Service time per item',
  content:
    'Adds extra minutes based on the total item quantity in the order. This value is added on top of the base service time per order and affects arrival times and total route duration.',
}
