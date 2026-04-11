Porpose: 
- hooks for interacting with the ./api for vehicle and keep the store in sync
- handles fetch errors with try except 
- handles rollbacks 
- handles data validation with clear logs on mutations or errors

Rules:
- uses the ./api for vehicle
- uses the ./store for vehicle and the apropiate selectors and actions.
- for displaying UI errors it uses the showMessage from the shared/message-handler/.

- a hook file for each type of responsability mutation and selectors. 

- on api calls the hooks  handle the updates of the store before calling the api.

- on create injects a client_id a unique id (str) generated for optimistic updates this function can be found in lib/utils/clientId.ts .



Notes:

- on the create call for vehicle it injects the client_id, updates the id on return








