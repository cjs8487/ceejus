/**
 * Represents a module used by the bot to process messages. Modules are self contained, and self functional chunks of
 * code which can be loaded dynamically by the bot when instantiated or reloaded. Modules should never rely on each
 * other, not should they expect the presence of another module. Having multiple modules active and handling the same
 * commands my result in undefinted behavior. Modules are inactive by default, but all modules loaded by the bots
 * configuration will be activated during the bots load sequence.
 */
class BotModule {
    constructor(commands) {
        this.commands = commands;
        this.active = false;
    }

    /**
     * Checks if this module should be handling a command.  Modules can choose to override this method to perform more
     * nuanced checks, but this behavior should be sufficient for most cases.
     *
     * @param {String} command The command to check against
     * @returns {Boolean} true if this command is recognized by the module and should be handled.
     */
    recognizesCommand(command) {
        return this.commands.includes(command);
    }

    /**
     * Activate the module. Activating a module means that it is instantiated properly and ready to begin handling input
     * immediately.
     */
    activate() {
        this.active = true;
    }

    /**
     * Deactivates the module. An inactive module is effectively ignored by the bot, and can be reactivated at any time
     * without potentially needing to reinstantiate the bot.
     */
    deactivate() {
        this.active = false;
    }

    /**
     * Checks the current status of the module
     * @returns {Boolean} true if the module is active
     */
    isActive() {
        return this.isActive;
    }

    /**
     * Handles an input, which will usually be a command
     *
     * @param {Array} commandParts the parts of the message, split on spaces.
     * @returns {String} The retrun value of the handled command. This is the value the bot will output to whatever IRC
     * server it is connected to
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    handleCommand(commandParts) {
        return '';
    }
}

module.exports.BotModule = BotModule;
