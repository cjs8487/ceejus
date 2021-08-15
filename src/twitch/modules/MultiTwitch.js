const { BotModule } = require('../../modules/BotModule');

class MultiTwitch extends BotModule {
    constructor() {
        super(['multi']);
        this.baseUrl = 'https://multistre.am';
        this.players = [];
        MultiTwitch.INSTANCE = this;
    }

    // eslint-disable-next-line class-methods-use-this
    handleCommand(commandParts, sender, mod) {
        const multiCommand = commandParts.shift();
        if (multiCommand === 'add') {
            let player;
            if (commandParts.length > 0) {
                // adding a specific player, need to be a mod for this
                if (mod) {
                    player = commandParts.shift();
                }
            } else {
                player = sender;
            }
            this.players.push(player);
            return `${player} added to the multitwitch link!`;
        }
        if (multiCommand === 'drop') {
            let player;
            if (commandParts.length > 0) {
                // adding a specific player, need to be a mod for this
                if (mod) {
                    player = commandParts.shift();
                }
            } else {
                player = sender;
            }
            const index = this.players.indexOf(player);
            if (index > -1) {
                this.players.splice(index, 1);
                return `${player} removed from the mutlitwitch link`;
            }
            if (player === sender) {
                return 'You were not in the multitwitch link!';
            }
            return `${player} is not in the multitwitch link!`;
        }
        // get the multitwitch link
        let url = this.baseUrl;
        this.players.forEach((player) => {
            url = `${url}/${player}`;
        });
        return url;
    }
}

module.exports.MultiTwitch = MultiTwitch;