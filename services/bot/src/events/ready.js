module.exports = {
    name: 'clientReady',
    once: true,
    execute(client) {
        console.log(`🤖 Bot ${client.user.tag} ready!`);
        require('../handlers/commandHandler')(client);
    },
};