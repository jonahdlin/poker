# To do

#### Meta

[x] Make to do list

#### Messaging

~[ ] Private messaging~

#### Infra

[x] Deploying
[x] Git repo
[ ] Separate messages from game state
[ ] Send diffs w/ hash of game state instead of entire game state object
[x] Remove different ports, host all on same server [docs](https://github.com/websockets/ws#multiple-servers-sharing-a-single-https-server)

#### Testing

[ ] Ability to seed deck for testing
[ ] Full game tests

#### Game

[x] Disconnect/reconnect
[ ] Game effects of disconnecting while at the table
[ ] Leaving table when 0 chips
[ ] Buying back in
[x] Single winner
[x] Multiple winners
[ ] Split pots
[ ] Marking away
[ ] Turn timer
[ ] Action queueing
[ ] Hotkeys
[ ] Scaling big blinds
[ ] Automatic starting next round
[x] Rounds
[x] Calling/betting/checking/folding
[ ] Spectators can choose names
[ ] Turn over/add admin
[ ] Approve ingress requests when players want to take a seat
[ ] Admin changes when admin leaves
[ ] Timer for starting next round instead of manual

##### Clientside indicators

[ ] Number of wins
[ ] Number of buy-ins
[ ] Player menu
[ ] Indicate admin in player menu
[ ] Game menu
[x] How much bet this betting round
[x] How much in pot this betting round
[x] Flop/turn/river
[x] Add indicator to show how much a call will be
[x] Raise/bet by amount

##### End of round summary

[ ] Show hands of players forced to show hands
[ ] Option for anyone to show hand

#### Bugs

[x] Incorrect minimum raise amount, never changes from 20
[ ] Sometimes players are not marked as disconnected when they leave (can repro with incognito window)
