Current Design Description
A dark-themed logistics operations dashboard with three vertical panels side by side.

Left panel — Map: Full-height interactive map (Google Maps, light terrain style) occupying roughly 45% of the screen width. Top-left has a "Multi Select" pill button. Top-right has a "Zones" pill button. Bottom-center has three circular icon buttons for map controls. Bottom-left has a circular "AI" button. Drawn on the map are polygon zone overlays with semi-transparent blue fill and blue stroke, each with a small dark label tooltip showing the zone name.

Middle panel — Plans: Dark background (#1a1f24 approx), ~25% screen width. Header row shows "Plans" title with a small info icon, a subtle stats line ("1 plan · 8 orders · 1 item"), and a "FOLD ›" control on the right. Below the header is a month navigator: left arrow, "March" label, right arrow, and a filter icon — all in a pill-shaped row. Below that is a plan card with a dark surface, showing an icon, "Plan for March 28" as title, date range, and a row of stats icons (orders, items, weight, volume, zones). An "Open" status badge sits top-right of the card. At the bottom of the panel, a "No more plans" muted label.

Right panel — Base column (Orders DB): Dark background, ~30% screen width. Header shows "Orders" title with stats. A search bar with filter icon and a "+ Order" teal button. Below is an active filter chip "Only unschedule orders ×". Body shows "No orders found" empty state.

Route group detail state (second and third images): When a plan is opened, the right panel transforms. The header now shows a group name ("No Zone"), subtitle stats, and a "CLOSE" button. Below the header, two sub-columns appear side by side:

Thin left sub-column (~80px): Stacked circular pills, each representing a route group. Each pill shows a percentage in the center (e.g. "63%"), a group name label below, and a colored status badge ("Open", "Processing"). A "+ New Group" button sits at the top. On hover, a floating tooltip card appears showing detailed stats: completion %, orders, active orders, items, weight, volume, state, progress points, next state, missing points.

Thick right sub-column: A route solution detail view. Header row has "+ Order" and "Edit" buttons plus a "⋮" menu. Below that, a full-width teal/dark "Optimize route ›" button with a dropdown chevron. The body is a vertical list of route stops, each as a card row: a numbered badge, destination address, "to" sub-label with stop range numbers, and a time window on the right. First and last items are special "ROUND TRIP · START/END LOCATION" rows. A large teal "Ready for Delivery" button is pinned to the bottom.

Proposed Design Description
Same three-panel dark dashboard layout. The map and plans column remain identical. The right panel route group detail state is updated as follows:

Thin left sub-column: Unchanged. Stacked circular route group pills with percentage, name, status badge, and hover tooltip.

Thick right sub-column — updated header: The header now has two rows instead of one.

First row (actions): Same as before — group name on the left, "+ Order" and "Edit" buttons, "⋮" menu on the right.
Second row (lane tab strip): A horizontal scrollable strip of compact pill-shaped tabs sitting flush below the action row, with a subtle separator line above. Each tab shows a lane name ("Lane 1", "Lane 2", "Lane 3") in small text. The active tab has a teal/cyan bottom border underline and slightly brighter text. Inactive tabs are muted. A tab with a draft route shows a small faint "draft" badge in the top-right corner of the pill. At the far right of the strip, a small "+ Lane" button with a plus icon.
Drag interaction affordance: When the user begins dragging a stop card upward, the lane tab strip visually activates — each inactive tab gets a subtle dashed border ring and a small downward arrow "↓" icon appears inside it, signaling it is a valid drop target. The dragged card shows a ghost/semi-transparent version. Hovering over an inactive tab for ~300ms causes it to highlight in teal with a label "Drop → Lane 2" appearing below it as a tooltip. Releasing the card on a tab moves the stop to the end of that lane's sequence and switches the view to that lane.

Stop row context menu: Each stop card row has a "⋮" icon on the right edge that appears on hover. Clicking it opens a small dark dropdown menu anchored to the row with options: "Move to Lane 2", "Move to Lane 3", "Duplicate to Lane…", "Remove from route."

Overall tone: Minimalist, dark UI. Teal/cyan as the primary accent color. All additions feel like natural extensions of existing elements — no new panels, no new columns, no layout shift.

Pass this to your image generator along with the screenshots for best results. Once you have the mockup back, share it here and I'll map it to actual component code.
