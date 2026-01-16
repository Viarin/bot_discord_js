const prefix = '!'; 

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        
        if (message.author.bot || !message.content.startsWith(prefix)) return;

 
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const client = message.client;
        const command = client.commands.get(commandName);

        if (!command) return; 

        
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            await message.reply('An error occurred while executing this command!');
        }
    },
};