I want to introduce the plan type capability, so that users can create route plans with different plan types on the same workspace that we have at the moment with route route planning.

In calendar mode the idea is that the user can move orders from the main order page ( /Users/davidloorenz/Desktop/Developer/BeyoApps_2025/NextMark-app-v2/Front_end/admin-app/src/features/order/pages/orderMain.page.tsx ) to a route plan date, currently i have the automatic behaviour of creating a route plan automatically when moving an order, we will continue to do this, but we will create a route plan with the correct plan_type based on the order order_plan_objective value. so the behaviour continues to be automatic and friendly all meant to act based on the inital user intention.

If the user is moving an order to a route plan where the order_plan_objective doesn't match to the plan_type, then we must present a popup warning explaining the order has the intention x but the target plan has type y, is this something you want to do? if the user says yes we continue the backend handles this passing between plan types and order.order_plan_objective ( we must update some parts optimistically and leave the parts that the frontend can't figure out as loading, until response comes back ). if no then the action never takes place.

On manual creation of a plan ( through the + plan button ), in that form the user will now have the posibility of slecting a route plan type ( defaults to local delivery ).

on the cards that display the route plans we can make the main icon to change based on the plan_type ( i belive this is already supported by the plan cards )

On the calendar we will need to add some light reference so that the user understand this plan is this plan_type ( we can't use color because that is taking by the route plan state ), but maybe we can use simplyfy icons ( same as the route plan cards ). i will play with this visual reference but for as long we have the condition build in the context, then it is easy to change the visual around.
