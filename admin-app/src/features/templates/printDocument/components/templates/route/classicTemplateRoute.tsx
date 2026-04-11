import type { CSSProperties } from 'react'

import type { availableOrientations } from '@/features/templates/printDocument/types'

type RouteTemplateItem = {
  article_number?: string | null
  item_type?: string | null
  quantity?: number | null
  properties?: Record<string, unknown> | null
}

type RouteTemplateOrder = {
  stop_order?: number | null
  order_reference_number?: string | null
  client_address?: string | null
  expected_arrival_time?: string | null
  items?: RouteTemplateItem[] | null
}

export type ClassicTemplateRouteProps = {
  orientation?: availableOrientations
  plan_date?: string | null
  stop_count?: number | null
  total_distance?: number | null
  total_travel_time?: string | null
  expected_start_time?: string | null
  expected_end_time?: string | null
  driver?: string | null
  item_count?: number | null
  total_weight?: number | null
  total_volume?: number | null
  orders?: RouteTemplateOrder[] | null
}

const pageStyle: CSSProperties = {
  width: '21cm',
  height: '29.7cm',
  boxSizing: 'border-box',
  padding: '0.9cm',
  backgroundColor: '#fff',
  color: '#1a1a1a',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45cm',
}

export const ClassicTemplateRoute = ({
  orientation = 'vertical',
  ...payload
}: ClassicTemplateRouteProps) => {
  const data = hydrateRoutePayload(payload)
  const orders = [...data.orders].sort((left, right) => {
    const leftOrder = left.stop_order ?? Number.POSITIVE_INFINITY
    const rightOrder = right.stop_order ?? Number.POSITIVE_INFINITY
    return leftOrder - rightOrder
  })

  return (
    <div style={pageStyle} data-template="classic-route" data-orientation={orientation}>
      <style>{`
        @media print {
          [data-template="classic-route"] {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <header style={{ borderBottom: '1px solid #1f1f1f', paddingBottom: '0.26cm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.6cm' }}>
          <h1 style={{ margin: 0, fontSize: '0.54cm', fontWeight: 700 }}>Route Logistics List</h1>
          <span style={{ fontSize: '0.32cm', fontWeight: 600 }}>Plan date: {toSafeText(data.plan_date)}</span>
        </div>
      </header>

      <section
        style={{
          border: '1px solid #b8b8b8',
          borderRadius: '0.18cm',
          padding: '0.28cm 0.34cm',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          rowGap: '0.18cm',
          columnGap: '0.36cm',
          fontSize: '0.29cm',
        }}
      >
        <SummaryField label="Stops" value={String(data.stop_count)} />
        <SummaryField label="Distance" value={`${formatNumber(data.total_distance)} km`} />
        <SummaryField label="Travel time" value={toSafeText(data.total_travel_time)} />
        <SummaryField label="Driver" value={toSafeText(data.driver)} />
        <SummaryField label="Expected start" value={toSafeText(data.expected_start_time)} />
        <SummaryField label="Expected end" value={toSafeText(data.expected_end_time)} />
        <SummaryField label="Items" value={String(data.item_count)} />
        <SummaryField label="Weight / Volume" value={`${formatNumber(data.total_weight)} / ${formatNumber(data.total_volume)}`} />
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.24cm', minHeight: 0 }}>
        {orders.map((order) => (
          <article
            key={`${toSafeText(order.order_reference_number)}-${toSafeText(order.stop_order)}`}
            style={{
              border: '1px solid #cecece',
              borderRadius: '0.14cm',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: '#f4f5f7',
                borderBottom: '1px solid #cecece',
                display: 'grid',
                gridTemplateColumns: '1.2cm 4.5cm 1fr 2.5cm',
                gap: '0.2cm',
                padding: '0.18cm 0.24cm',
                fontSize: '0.28cm',
                fontWeight: 600,
              }}
            >
              <span>#{toSafeText(order.stop_order)}</span>
              <span>{toSafeText(order.order_reference_number)}</span>
              <span>{toSafeText(order.client_address)}</span>
              <span style={{ textAlign: 'right' }}>ETA {toSafeText(order.expected_arrival_time)}</span>
            </div>

            <div style={{ padding: '0.2cm 0.24cm' }}>
              {order.items?.length ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.25cm', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '24%' }} />
                    <col style={{ width: '24%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '40%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={cellHeadStyle}>Article</th>
                      <th style={cellHeadStyle}>Type</th>
                      <th style={{ ...cellHeadStyle }}>Qty</th>
                      <th style={cellHeadStyle}>Properties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={`${toSafeText(item.article_number)}-${index}`}>
                        <td style={cellBodyStyle}>{toSafeText(item.article_number)}</td>
                        <td style={cellBodyStyle}>{toSafeText(item.item_type)}</td>
                        <td style={{ ...cellBodyStyle}}>{toSafeText(item.quantity)}</td>
                        <td style={cellBodyStyle}>{formatProperties(item.properties)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ fontSize: '0.24cm', color: '#5a5a5a' }}>No items on this stop.</div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

const SummaryField = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.06cm' }}>
    <span style={{ color: '#616161', fontSize: '0.23cm', textTransform: 'uppercase', letterSpacing: '0.01cm' }}>{label}</span>
    <span style={{ fontSize: '0.3cm', fontWeight: 600 }}>{value}</span>
  </div>
)

const cellHeadStyle: CSSProperties = {
  borderBottom: '1px solid #d7d7d7',
  color: '#555',
  fontWeight: 600,
  paddingBottom: '0.08cm',
  paddingLeft: 0,
  paddingRight: '0.08cm',
  textAlign: 'left',
}

const cellBodyStyle: CSSProperties = {
  borderBottom: '1px solid #ececec',
  paddingTop: '0.08cm',
  paddingBottom: '0.08cm',
  paddingRight: '0.08cm',
  verticalAlign: 'top',
}

const toSafeText = (value: unknown) => {
  if (value == null) return '--'
  const text = String(value).trim()
  return text.length ? text : '--'
}

const formatNumber = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

const formatProperties = (properties?: Record<string, unknown> | null) => {
  if (!properties) return '--'
  const entries = Object.entries(properties).filter(([key]) => key.toLowerCase() !== 'notes')
  if (!entries.length) return '--'

  return entries
    .map(([key, value]) => `${key}: ${toSafeText(value)}`)
    .join('  ·  ')
}

const hydrateRoutePayload = (payload: ClassicTemplateRouteProps) => {
  if (payload.orders?.length) {
    return {
      ...payload,
      orders: payload.orders,
      stop_count: payload.stop_count ?? payload.orders.length,
    }
  }

  const sampleOrders: RouteTemplateOrder[] = [
    {
      stop_order: 1,
      order_reference_number: 'ORD-10234',
      client_address: '14 North Bridge Ave',
      expected_arrival_time: '08:45',
      items: [
        { article_number: 'A-9932', item_type: 'Dining Chair', quantity: 4, properties: { color: 'Oak', floor: 2 } },
        { article_number: 'B-1109', item_type: 'Dining Table', quantity: 1, properties: { size: '180x90' } },
      ],
    },
    {
      stop_order: 2,
      order_reference_number: 'ORD-10235',
      client_address: '8B Lake Park Road',
      expected_arrival_time: '09:20',
      items: [{ article_number: 'C-4311', item_type: 'Bookshelf', quantity: 2, properties: { levels: 5 } }],
    },
  ]

  return {
    plan_date: payload.plan_date ?? '2026-02-18',
    stop_count: payload.stop_count ?? sampleOrders.length,
    total_distance: payload.total_distance ?? 34.6,
    total_travel_time: payload.total_travel_time ?? '04:15',
    expected_start_time: payload.expected_start_time ?? '08:00',
    expected_end_time: payload.expected_end_time ?? '12:15',
    driver: payload.driver ?? 'Driver Name',
    item_count: payload.item_count ?? 7,
    total_weight: payload.total_weight ?? 224.4,
    total_volume: payload.total_volume ?? 4.8,
    orders: sampleOrders,
  }
}

export default ClassicTemplateRoute
