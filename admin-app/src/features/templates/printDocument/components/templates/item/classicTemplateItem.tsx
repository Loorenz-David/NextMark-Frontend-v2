import type { CSSProperties } from 'react'

import type { Item } from '@/features/order/item/types/item'
import { getIsoWeekLabel } from '@/shared/utils/formatIsoDate'
import type { availableOrientations } from '../../../types'


type ExtraProps = {
    delivery_date: string
    order_reference_number:string
}
export type ClassicTemplateItemProps =  {
  itemPayload?: Partial<Item & ExtraProps>
  orientation: availableOrientations
}


const labelRootStyle: CSSProperties = {
  width: '5cm',
  height: '7cm',
  backgroundColor: '#fff',
  border: '0.5px solid #989898',
  boxSizing: 'border-box',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  color: '#111',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const rowStyle: CSSProperties = {
  padding: '0.18cm 0.22cm',
  boxSizing: 'border-box',
}

const borderRowStyle: CSSProperties = {
  ...rowStyle,
  borderBottom: '1px solid #111',
}

export const ClassicTemplateItem = ({itemPayload, orientation}: ClassicTemplateItemProps) => {
  let item = itemPayload
  if(!item){
    item = dummyItem
  }

  const dateLabel = item?.delivery_date ?? 'missing date'
  const weekLabel = getIsoWeekLabel(item?.delivery_date) ?? 'V --'

  const orderLabel = toSafeText(item?.order_reference_number)
  const itemLabel = toSafeText( item?.article_number || item?.reference_number )
  const nameLabel = toSafeText(item?.item_type)
  const quantityLabel = `${toSafeText(item?.quantity)} . qua`
  const propertiesLabel = formatProperties(item?.properties)

  

  return (
    <div data-template="classic-item" style={labelRootStyle}>
      <style>{`
        @media print {
          [data-template="classic-item"] {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div style={{ ...borderRowStyle, minHeight: '0.78cm', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.29cm', fontWeight: 500, whiteSpace:'pre' }}>{dateLabel}</span>
        <span style={{ fontSize: '0.29cm', fontWeight: 600 }}>{weekLabel}</span>
      </div>

      <div style={{ ...borderRowStyle, minHeight: '1.68cm', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.2cm' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15cm 1fr', gap: '0.12cm', alignItems: 'center' }}>
          <span style={{ fontSize: '0.26cm', fontWeight: 500 }}>Order:</span>
          <span style={{ fontSize: '0.26cm' ,textAlign: 'right' }}>{orderLabel}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15cm 1fr', gap: '0.12cm', alignItems: 'center' }}>
          <span style={{ fontSize: '0.26cm', fontWeight: 500 }}>Item:</span>
          <span style={{ fontSize: '0.26cm', textAlign: 'right'  }}>{itemLabel}</span>
        </div>
      </div>

      <div style={{ ...borderRowStyle, minHeight: '1.6cm', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.24cm' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.18cm' }}>
          <span style={{ display: 'block', fontSize: '0.28cm', lineHeight: '0.34cm', paddingBottom: '0.03cm', maxWidth: '3.4cm', whiteSpace: 'nowrap', textOverflow: 'ellipsis', }}>
            {nameLabel}
          </span>
          <span style={{ fontSize: '0.28cm', whiteSpace: 'nowrap' }}>{quantityLabel}</span>
        </div>
        <div style={{ display: 'block', fontSize: '0.20cm', lineHeight: '0.27cm', paddingBottom: '0.03cm', whiteSpace: 'nowrap', textOverflow: 'ellipsis',  }}>
          {propertiesLabel}
        </div>
      </div>

      <div style={{ ...rowStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>

        <div
          style={{
            marginTop: 'auto',
            height: '1.45cm',
            borderRadius: '0.26cm',
            border: '1px solid #111',
          }}
        />
      </div>
    </div>
  )
}


const dummyItem = {
  delivery_date:'2026-01-01',
  item_type:'Bookshelf',
  order_reference_number:'93.04.1324',
  article_number: '2345324534',
  properties:{'keys': 'true', 'levels':'5'},
  quantity:12
}


const toSafeText = (value: unknown) => {
  if (value == null || !value ) return '--'
  const text = String(value).trim()
  return text.length > 0 ? text : '--'
}





const formatProperties = (properties?: Record<string, unknown> | null) => {
  if (!properties) return '--'

  const values = Object.entries(properties)
    .filter(([key]) => key.toLowerCase() !== 'notes')
    .map(([key, value]) => {
      const safeValue = toSafeText(value)
      return `${key}: ${safeValue}`
    })
    .filter(Boolean)

  if (values.length === 0) return '--'
  return values.join('\u00A0\u00A0\u00A0·\u00A0\u00A0\u00A0')
}



export default ClassicTemplateItem
