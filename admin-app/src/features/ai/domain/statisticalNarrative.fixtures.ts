import type { AIThreadMessageResponse } from '../types/ai'

export const STATISTICAL_NARRATIVE_FIXTURES: AIThreadMessageResponse[] = [
  {
    thread_id: 'thr_stats_canonical_001',
    message: {
      role: 'assistant',
      status_label: 'Completed',
      intent: 'summary_with_blocks',
      narrative_policy: 'no_enumeration',
      content:
        'Observation: Demand is concentrated in three corridors, with North Hub growing fastest and South Line showing the longest delivery times. Impact: South Line is likely driving avoidable service friction. Action: Prioritize South Line for route balancing first, then validate improvement against on-time and duration metrics.',
      rendering_hints: {
        has_blocks: true,
        suppress_raw_data_preview: true,
        text_section_title: 'Narrative',
        block_section_title: 'Analytics',
      },
      blocks: [
        {
          id: 'blk_narrative_intro_core_metrics',
          kind: 'summary',
          title: 'What The Core Metrics Indicate',
          data: {
            text: 'Observation: Throughput and on-time performance are improving, while average duration is rising. Impact: Capacity is absorbing demand, but efficiency is beginning to degrade. Action: Identify delay clusters by corridor and stop sequence before the duration trend worsens.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_metrics_core',
          kind: 'analytics',
          entity_type: 'analytics',
          layout: 'metric_grid',
          title: 'Core Metrics',
          subtitle: 'Last 30 days',
          data: {
            metrics: [
              {
                id: 'orders_total',
                label: 'Orders',
                value: 1842,
                display_value: '1,842',
                change_label: '+12.4% vs prior period',
                trend: 'up',
                value_type: 'integer',
              },
              {
                id: 'on_time_rate',
                label: 'On-time rate',
                value: 96.7,
                display_value: '96.7%',
                change_label: '+1.1pp',
                trend: 'up',
                emphasis: 'positive',
                value_type: 'percentage',
                unit: '%',
              },
              {
                id: 'avg_duration',
                label: 'Avg duration',
                value: 41.8,
                display_value: '41.8 min',
                change_label: '+3.2 min',
                trend: 'down',
                emphasis: 'warning',
                value_type: 'duration_minutes',
              },
            ],
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_narrative_intro_corridor_share',
          kind: 'summary',
          title: 'How To Read Corridor Share',
          data: {
            text: 'Observation: North Hub and Central Axis carry most volume, while South Line carries less volume. Impact: Even with lower share, South Line delays can still degrade overall service quality. Action: Treat South Line as a high-leverage optimization target while preserving stability in high-volume corridors.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_zone_rank',
          kind: 'analytics',
          entity_type: 'analytics',
          layout: 'bar_list',
          title: 'Orders by Corridor',
          subtitle: 'Share of volume',
          data: {
            items: [
              {
                id: 'north_hub',
                label: 'North Hub',
                value: 42,
                display_value: '42%',
                hint: 'Highest weekend concentration',
                color: '#84D3FF',
              },
              {
                id: 'central_axis',
                label: 'Central Axis',
                value: 33,
                display_value: '33%',
                color: '#71CDE9',
              },
              {
                id: 'south_line',
                label: 'South Line',
                value: 25,
                display_value: '25%',
                color: '#5F93D9',
              },
            ],
          },
          meta: {
            schema_version: 1,
            chartType: 'line',
          },
        },
        {
          id: 'blk_narrative_intro_corridor_table',
          kind: 'summary',
          title: 'Operational Conclusion',
          data: {
            text: 'Observation: South Line underperforms on both punctuality and average delivery duration. Impact: It is the clearest source of performance drag across corridors. Action: Apply route balancing and capacity smoothing in South Line first, then re-check corridor-level KPIs.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_corridor_breakdown_table',
          kind: 'analytics',
          entity_type: 'analytics',
          layout: 'table',
          title: 'Corridor Breakdown',
          data: {
            columns: [
              { id: 'corridor', label: 'Corridor' },
              { id: 'orders', label: 'Orders', align: 'right' },
              { id: 'on_time', label: 'On-time', align: 'right' },
              { id: 'avg_min', label: 'Avg min', align: 'right' },
            ],
            rows: [
              { id: 'r1', corridor: 'North Hub', orders: 774, on_time: '98.1%', avg_min: 36.2 },
              { id: 'r2', corridor: 'Central Axis', orders: 608, on_time: '96.2%', avg_min: 40.9 },
              { id: 'r3', corridor: 'South Line', orders: 460, on_time: '93.9%', avg_min: 49.7 },
            ],
          },
          meta: {
            schema_version: 1,
          },
        },
      ],
      actions: [
        {
          id: 'act_apply_south_filter',
          type: 'apply_order_filters',
          label: 'Focus South Line',
          payload: {
            mode: 'merge',
            filters: {
              plan_type: 'local_delivery',
            },
          },
        },
      ],
      tool_trace: [],
    },
  },
  {
    thread_id: 'thr_stats_narrative_native_001',
    message: {
      role: 'assistant',
      status_label: 'Completed',
      intent: 'summary_with_blocks',
      content:
        'Observation: Service quality remains stable at the top level, but suburban routes are slowing. Impact: Local inefficiencies may grow while headline KPIs still look healthy. Action: Investigate suburban trend signals early and apply targeted corrections before SLA risk expands.',
      rendering_hints: {
        has_blocks: true,
        suppress_raw_data_preview: true,
      },
      blocks: [
        {
          id: 'blk_narrative_native_intro_kpi',
          kind: 'summary',
          title: 'KPI Interpretation',
          data: {
            text: 'Observation: Completion rate is high and still improving. Impact: Global execution reliability is strong, but localized inefficiencies can remain hidden. Action: Use this KPI as a baseline while validating route-level efficiency trends separately.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_narrative_kpi',
          kind: 'analytics_kpi',
          title: 'Delivery completion rate',
          data: {
            metric_name: 'Completion rate',
            value: 96.5,
            display_value: '96.5%',
            delta: 2.1,
            unit: '%',
            description: 'Compared to previous 7 days',
            confidence_score: 0.92,
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_narrative_native_intro_trend',
          kind: 'summary',
          title: 'Trend Interpretation',
          data: {
            text: 'Observation: Minutes per stop are increasing week over week. Impact: Route efficiency is declining even though completion remains high. Action: Check congestion, stop sequencing, and route load distribution to isolate the primary bottleneck.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_narrative_trend',
          kind: 'analytics_trend',
          title: 'Route efficiency trend',
          data: {
            direction: 'down',
            description: 'Minutes per stop increased across suburban routes.',
            confidence_score: 0.87,
            data_points: [
              { label: 'Week 1', value: 8.1 },
              { label: 'Week 2', value: 8.4 },
              { label: 'Week 3', value: 8.8 },
            ],
          },
          meta: {
            schema_version: 1,
            chartType: 'donut',
          },
        },
        {
          id: 'blk_narrative_native_intro_breakdown',
          kind: 'summary',
          title: 'Distribution Interpretation',
          data: {
            text: 'Observation: Most orders are completed, but a delayed tail is still present. Impact: Small delay percentages can produce disproportionate customer-visible SLA risk. Action: Target delayed-tail reduction before broad optimization of already healthy segments.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_narrative_breakdown',
          kind: 'analytics_breakdown',
          title: 'Delivery status distribution',
          data: {
            description: 'Completed orders account for over two thirds of active workload.',
            confidence_score: 0.95,
            components: [
              { label: 'Completed', value: 847, percentage: 67.8 },
              { label: 'Preparing', value: 312, percentage: 24.9 },
              { label: 'Delayed', value: 92, percentage: 7.3 },
            ],
          },
          meta: {
            schema_version: 1,
            chartType: 'bar',
          },
        },
      ],
      actions: [],
      tool_trace: [],
    },
  },
  {
    thread_id: 'thr_stats_blocks_only_001',
    message: {
      role: 'assistant',
      status_label: 'Completed',
      intent: 'blocks_only',
      content: 'This text is intentionally hidden because intent is blocks_only.',
      rendering_hints: {
        has_blocks: true,
        suppress_raw_data_preview: true,
        block_section_title: 'Operations Analytics',
      },
      blocks: [
        {
          id: 'blk_blocks_only_intro_grid',
          kind: 'summary',
          title: 'Throughput Reading',
          data: {
            text: 'Observation: Planner throughput is strong relative to manual overrides. Impact: Standard workflows are doing most of the operational work. Action: Reduce reassignment churn while maintaining current throughput and override rates.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_blocks_only_grid',
          kind: 'analytics',
          entity_type: 'analytics',
          layout: 'metric_grid',
          title: 'Planner Throughput',
          data: {
            metrics: [
              { id: 'plans_created', label: 'Plans created', value: 126, display_value: '126' },
              { id: 'orders_reassigned', label: 'Orders reassigned', value: 482, display_value: '482' },
              { id: 'manual_overrides', label: 'Manual overrides', value: 17, display_value: '17', emphasis: 'warning' },
            ],
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_blocks_only_intro_bar',
          kind: 'summary',
          title: 'Reassignment Mix Interpretation',
          data: {
            text: 'Observation: Most reassignments are capacity-driven rather than manual-exception driven. Impact: Planning pressure is the primary source of reactive movement. Action: Improve capacity forecasting and pre-balance routes earlier to reduce reactive reassignments.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_blocks_only_bar',
          kind: 'analytics',
          entity_type: 'analytics',
          layout: 'bar_list',
          title: 'Reassignment Source',
          data: {
            items: [
              { id: 'capacity', label: 'Capacity balancing', value: 54, display_value: '54%' },
              { id: 'sla', label: 'SLA risk mitigation', value: 31, display_value: '31%' },
              { id: 'manual', label: 'Manual intervention', value: 15, display_value: '15%' },
            ],
          },
          meta: {
            schema_version: 1,
          },
        },
      ],
      actions: [],
      tool_trace: [],
      typed_warnings: [
        {
          code: 'ANALYTICS_SAMPLE_WARNING',
          message: 'Sample payload generated for frontend visualization.',
        },
      ],
    },
  },
  {
    thread_id: 'thr_logistics_orders_today_001',
    message: {
      role: 'assistant',
      status_label: 'Completed',
      intent: 'summary_with_blocks',
      narrative_policy: 'no_enumeration',
      content:
        'Observation: There are 8 orders scheduled for today, with most concentrated in the morning window. Impact: Unassigned high-item orders in that window can cause route compression and late departures. Action: Assign high-item orders first and rebalance the late-morning cluster before dispatch.',
      rendering_hints: {
        has_blocks: true,
        suppress_raw_data_preview: true,
        text_section_title: 'Today Overview',
        block_section_title: 'Scheduled Orders',
      },
      blocks: [
        {
          id: 'blk_today_orders_intro',
          kind: 'summary',
          title: 'How To Use This View',
          data: {
            text: 'Observation: This table lists all orders scheduled for today. Impact: Delays usually come from high-item orders that remain unassigned close to cutoff. Action: Use table rows to inspect orders quickly, then review priority cards for immediate assignment decisions.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_today_orders_table',
          kind: 'entity_collection',
          entity_type: 'order',
          layout: 'table',
          title: 'Orders Scheduled For Today',
          subtitle: 'Tap a row to open order details',
          data: {
            items: [
              {
                id: 'ord_today_001',
                order_scalar_id: 5101,
                total_items: 6,
                client_first_name: 'Laura',
                client_last_name: 'Mendez',
                client_address: { street_address: 'Av. Libertador 802' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'web_portal',
              },
              {
                id: 'ord_today_002',
                order_scalar_id: 5102,
                total_items: 2,
                client_first_name: 'Daniel',
                client_last_name: 'Ruiz',
                client_address: { street_address: 'Calle 9 #142' },
                order_state_id: 1,
                operation_type: 'pickup',
                external_source: 'marketplace',
              },
              {
                id: 'ord_today_003',
                order_scalar_id: 5103,
                total_items: 9,
                client_first_name: 'Carla',
                client_last_name: 'Paz',
                client_address: { street_address: 'Boulevard Norte 1210' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'web_portal',
              },
              {
                id: 'ord_today_004',
                order_scalar_id: 5104,
                total_items: 4,
                client_first_name: 'Marco',
                client_last_name: 'Alfaro',
                client_address: { street_address: 'Pasaje Alameda 55' },
                order_state_id: 3,
                operation_type: 'delivery',
                external_source: 'pos',
              },
              {
                id: 'ord_today_005',
                order_scalar_id: 5105,
                total_items: 7,
                client_first_name: 'Ines',
                client_last_name: 'Vega',
                client_address: { street_address: 'Ruta 3 km 18' },
                order_state_id: 1,
                operation_type: 'delivery',
                external_source: 'marketplace',
              },
              {
                id: 'ord_today_006',
                order_scalar_id: 5106,
                total_items: 1,
                client_first_name: 'Jorge',
                client_last_name: 'Soto',
                client_address: { street_address: 'Calle San Martin 404' },
                order_state_id: 2,
                operation_type: 'pickup',
                external_source: 'web_portal',
              },
              {
                id: 'ord_today_007',
                order_scalar_id: 5107,
                total_items: 5,
                client_first_name: 'Lucia',
                client_last_name: 'Ibarra',
                client_address: { street_address: 'Barrio Los Cedros Mz 14' },
                order_state_id: 1,
                operation_type: 'delivery',
                external_source: 'pos',
              },
              {
                id: 'ord_today_008',
                order_scalar_id: 5108,
                total_items: 3,
                client_first_name: 'Tomas',
                client_last_name: 'Farias',
                client_address: { street_address: 'Diagonal 11 #889' },
                order_state_id: 4,
                operation_type: 'delivery',
                external_source: 'marketplace',
              },
            ],
          },
          meta: {
            schema_version: 1,
            table: {
              columns: ['order_scalar_id', 'total_items', 'client_name', 'street_address'],
            },
          },
        },
        {
          id: 'blk_today_priority_intro',
          kind: 'summary',
          title: 'Priority Assignments',
          data: {
            text: 'Observation: Three orders combine high item count and early schedule windows. Impact: If these are assigned late, dispatch will likely slip and create downstream route pressure. Action: Assign these orders first and lock a driver before processing lower-impact orders.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_today_priority_cards',
          kind: 'entity_collection',
          entity_type: 'order',
          layout: 'cards',
          title: 'High Priority Orders',
          subtitle: 'Tap a card to open details',
          data: {
            items: [
              {
                id: 'ord_today_003',
                order_scalar_id: 5103,
                total_items: 9,
                client_first_name: 'Carla',
                client_last_name: 'Paz',
                client_address: { street_address: 'Boulevard Norte 1210' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'web_portal',
              },
              {
                id: 'ord_today_005',
                order_scalar_id: 5105,
                total_items: 7,
                client_first_name: 'Ines',
                client_last_name: 'Vega',
                client_address: { street_address: 'Ruta 3 km 18' },
                order_state_id: 1,
                operation_type: 'delivery',
                external_source: 'marketplace',
              },
              {
                id: 'ord_today_001',
                order_scalar_id: 5101,
                total_items: 6,
                client_first_name: 'Laura',
                client_last_name: 'Mendez',
                client_address: { street_address: 'Av. Libertador 802' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'web_portal',
              },
            ],
          },
          meta: {
            schema_version: 1,
          },
        },
      ],
      actions: [
        {
          id: 'act_today_filter_pending',
          type: 'apply_order_filters',
          label: 'Show Pending Today',
          payload: {
            mode: 'merge',
            search: 'today',
            filters: {
              order_state_id: [1, 2],
            },
          },
        },
        {
          id: 'act_open_orders_home',
          type: 'navigate',
          label: 'Open Order Board',
          payload: {
            path: '/',
          },
        },
      ],
      tool_trace: [],
    },
  },
  {
    thread_id: 'thr_logistics_late_risk_001',
    message: {
      role: 'assistant',
      status_label: 'Completed',
      intent: 'summary_with_blocks',
      narrative_policy: 'no_enumeration',
      content:
        'Observation: Five orders are at risk of breaching delivery windows within the next 90 minutes. Impact: If not reassigned quickly, these delays can cascade into route-level SLA failures. Action: Prioritize high-item delayed orders first, then rebalance nearby pending stops.',
      rendering_hints: {
        has_blocks: true,
        suppress_raw_data_preview: true,
        text_section_title: 'Risk Overview',
        block_section_title: 'Late-Risk Orders',
      },
      blocks: [
        {
          id: 'blk_late_risk_intro',
          kind: 'summary',
          title: 'How To Triage Late Risk',
          data: {
            text: 'Observation: The table ranks orders with the highest short-term delay exposure. Impact: The first 2 to 3 orders usually determine whether the route recovers or slips further. Action: Open each top row, confirm assignment status, and dispatch mitigation actions immediately.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_late_risk_table',
          kind: 'entity_collection',
          entity_type: 'order',
          layout: 'table',
          title: 'Orders At Immediate SLA Risk',
          subtitle: 'Tap a row to inspect and resolve',
          data: {
            items: [
              {
                id: 'ord_risk_001',
                order_scalar_id: 6201,
                total_items: 10,
                client_first_name: 'Marina',
                client_last_name: 'Lopez',
                client_address: { street_address: 'Av. Dorrego 1540' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'marketplace',
              },
              {
                id: 'ord_risk_002',
                order_scalar_id: 6202,
                total_items: 8,
                client_first_name: 'Sebastian',
                client_last_name: 'Rojas',
                client_address: { street_address: 'San Martin 778' },
                order_state_id: 3,
                operation_type: 'delivery',
                external_source: 'web_portal',
              },
              {
                id: 'ord_risk_003',
                order_scalar_id: 6203,
                total_items: 5,
                client_first_name: 'Paula',
                client_last_name: 'Quintero',
                client_address: { street_address: 'Belgrano 221' },
                order_state_id: 1,
                operation_type: 'pickup',
                external_source: 'pos',
              },
              {
                id: 'ord_risk_004',
                order_scalar_id: 6204,
                total_items: 7,
                client_first_name: 'Nicolas',
                client_last_name: 'Cano',
                client_address: { street_address: 'Bv. Colon 492' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'marketplace',
              },
              {
                id: 'ord_risk_005',
                order_scalar_id: 6205,
                total_items: 4,
                client_first_name: 'Rocio',
                client_last_name: 'Acosta',
                client_address: { street_address: 'Pje. Mitre 63' },
                order_state_id: 3,
                operation_type: 'delivery',
                external_source: 'web_portal',
              },
            ],
          },
          meta: {
            schema_version: 1,
            table: {
              columns: ['order_scalar_id', 'total_items', 'client_name', 'street_address'],
            },
          },
        },
        {
          id: 'blk_late_risk_cards_intro',
          kind: 'summary',
          title: 'Top Priority Cards',
          data: {
            text: 'Observation: These cards isolate the orders with the largest potential SLA impact. Impact: Delaying intervention here raises the chance of multi-stop route disruption. Action: Assign or reassign these orders now, then monitor for recovery in the next dispatch cycle.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_late_risk_cards',
          kind: 'entity_collection',
          entity_type: 'order',
          layout: 'cards',
          title: 'Critical Orders To Stabilize',
          subtitle: 'Tap a card to open details',
          data: {
            items: [
              {
                id: 'ord_risk_001',
                order_scalar_id: 6201,
                total_items: 10,
                client_first_name: 'Marina',
                client_last_name: 'Lopez',
                client_address: { street_address: 'Av. Dorrego 1540' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'marketplace',
              },
              {
                id: 'ord_risk_002',
                order_scalar_id: 6202,
                total_items: 8,
                client_first_name: 'Sebastian',
                client_last_name: 'Rojas',
                client_address: { street_address: 'San Martin 778' },
                order_state_id: 3,
                operation_type: 'delivery',
                external_source: 'web_portal',
              },
              {
                id: 'ord_risk_004',
                order_scalar_id: 6204,
                total_items: 7,
                client_first_name: 'Nicolas',
                client_last_name: 'Cano',
                client_address: { street_address: 'Bv. Colon 492' },
                order_state_id: 2,
                operation_type: 'delivery',
                external_source: 'marketplace',
              },
            ],
          },
          meta: {
            schema_version: 1,
          },
        },
      ],
      actions: [
        {
          id: 'act_late_risk_pending',
          type: 'apply_order_filters',
          label: 'Show Late-Risk Pending',
          payload: {
            mode: 'merge',
            search: 'late risk',
            filters: {
              order_state_id: [1, 2, 3],
            },
          },
        },
        {
          id: 'act_late_risk_open_board',
          type: 'navigate',
          label: 'Open Dispatch Board',
          payload: {
            path: '/',
          },
        },
      ],
      tool_trace: [],
    },
  },
  {
    thread_id: 'thr_logistics_empty_risk_001',
    message: {
      role: 'assistant',
      status_label: 'Completed',
      intent: 'summary_with_blocks',
      narrative_policy: 'no_enumeration',
      content:
        'Observation: No orders are currently flagged as late-risk across active routes. Impact: All deliveries are tracking within their windows and no SLA breaches are anticipated in the next dispatch cycle. Action: Continue monitoring. No immediate intervention is needed.',
      rendering_hints: {
        has_blocks: true,
        suppress_raw_data_preview: true,
        text_section_title: 'Risk Overview',
        block_section_title: 'Late-Risk Orders',
      },
      blocks: [
        {
          id: 'blk_empty_risk_context',
          kind: 'summary',
          title: 'Current Risk Posture',
          data: {
            text: 'Observation: The late-risk queue is clear. All monitored orders are on schedule relative to their delivery windows. Impact: Route capacity is balanced and no reactive dispatching is required. Action: Review again after the next route update cycle to confirm the status holds.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_empty_risk_table',
          kind: 'entity_collection',
          entity_type: 'order',
          layout: 'table',
          title: 'Orders At Immediate SLA Risk',
          subtitle: 'No late-risk orders at this time',
          data: {
            items: [],
          },
          meta: {
            schema_version: 1,
            table: {
              columns: ['order_scalar_id', 'total_items', 'client_name', 'street_address'],
            },
          },
        },
        {
          id: 'blk_empty_risk_cards_context',
          kind: 'summary',
          title: 'Priority Queue Status',
          data: {
            text: 'Observation: There are no critical orders requiring immediate attention. Impact: Dispatch teams can shift focus to proactive planning rather than reactive triage. Action: Use this window to pre-assign capacity for upcoming high-volume periods.',
          },
          meta: {
            schema_version: 1,
          },
        },
        {
          id: 'blk_empty_risk_cards',
          kind: 'entity_collection',
          entity_type: 'order',
          layout: 'cards',
          title: 'Critical Orders To Stabilize',
          subtitle: 'No critical orders at this time',
          data: {
            items: [],
          },
          meta: {
            schema_version: 1,
          },
        },
      ],
      actions: [
        {
          id: 'act_empty_risk_view_today',
          type: 'apply_order_filters',
          label: "View Today's Orders",
          payload: {
            mode: 'replace',
            search: 'today',
            filters: {
              order_state_id: [1, 2, 3],
            },
          },
        },
        {
          id: 'act_empty_risk_open_board',
          type: 'navigate',
          label: 'Open Dispatch Board',
          payload: {
            path: '/',
          },
        },
      ],
      tool_trace: [],
    },
  },
]

export const STATISTICAL_NARRATIVE_FIXTURES_BY_THREAD_ID =
  STATISTICAL_NARRATIVE_FIXTURES.reduce<Record<string, AIThreadMessageResponse>>((acc, item) => {
    acc[item.thread_id] = item
    return acc
  }, {})
