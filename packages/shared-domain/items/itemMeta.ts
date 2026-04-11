export type ItemQueryFilters = {
  order_id?: number
  after_id?: number
  before_id?: number
  limit?: number
  sort?: 'id_asc' | 'id_desc'
}
