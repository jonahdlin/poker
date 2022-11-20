# To do

#### Meta

[x] Make to do list

#### Messaging

[ ] Private messaging

#### Infra

[ ] Deploying
[x] Git repo
[ ] Separate messages from game state
[ ] Send diffs w/ hash of game state instead of entire game state object
[ ] Remove different ports, host all on same server [docs](https://github.com/websockets/ws#multiple-servers-sharing-a-single-https-server)

#### Game

[ ] Game effects of disconnecting while at the table
[ ] Marking away
[ ] Turn timer
[ ] Action queueing
[ ] Hotkeys
[ ] Scaling big blinds
[ ] Automatic starting next round
[x] Rounds
[x] Calling/betting/checking/folding

##### Clientside indicators

[x] How much bet this betting round
[x] How much in pot this betting round
[x] Flop/turn/river
[x] Add indicator to show how much a call will be
[x] Raise/bet by amount

##### Winning logic

[x] Single winner
[x] Multiple winners
[ ] Side pots

##### End of round summary

[ ] Show hands of players forced to show hands
[ ] Option for anyone to show hand

#### Admin controls

[ ] Turn over/add admin
[ ] Approve ingress requests when players want to take a seat
[ ] Timer for starting next round instead of manual

#### Player view

[ ] Create one

#### Bugs

[ ] Incorrect minimum raise amount, never changes from 20
