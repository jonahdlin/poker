# Jonah's Unnamed Poker Application

Welcome to my unnamed poker app. This is an interest project I'm doing in my spare time to learn more about real time application development.

I've also got a weekly online poker night with friends and it would be pretty cool to have control over the application we use so we can add whatever features we want.

## Developing

1. Clone repo
2. Grab yourself a copy of node (currently the project's on v16.16.0)
3. In the `/server` directory
   1. Run `npm i` to install serverside dependencies
   2. Run `npm run et` to export API types to the client
   3. Run `npm run start` to start the server
4. In the `/client` directory, run `npm i` to install dependencies
   1. Run `npm i` to install clientside dependencies
   2. Run `npm run start` to start the client

Once the client spins up you will be able to access it in a browser at `localhost:3000`.

The server **does not** automatically refresh when you make changes to it, so any changes in the `/server` folder will require stopping the server (thereby killing any ongoing sessions) and restarting it with `npm run start`. Make sure that if you make changes to `/server/src/types.ts` that you re-run `npm run et` to export the types to the client before starting the server back up again.

The client **does** watch for changes in the `/client` directory and refreshes when you make changes there (without even reloading the page!).
