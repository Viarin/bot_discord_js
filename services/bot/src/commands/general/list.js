const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'list',
    description: 'all commands list',
    execute(message, args) {
        const { commands } = message.client;

        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Commands List')
            .setDescription("That's all I can do.:")
            .setFooter({ text: `Total commands: ${commands.size}` })
            .setTimestamp();

  
        const sortedCommands = [...commands.values()].sort((a, b) => a.name.localeCompare(b.name));

      
        sortedCommands.forEach(command => {
            embed.addFields({
                name: `!${command.name}`,
                value: command.description || 'Description missing', 
                inline: false // false - кожна команда з нового рядка, true - плиткою
            });
        });

        // Відправляємо
        message.reply({ embeds: [embed] });
    }
};