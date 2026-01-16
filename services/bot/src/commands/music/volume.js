module.exports = {
    name: 'volume',
    description: 'Change volume (1-1000)',
    async execute(message, args) {
        const queue = message.client.queue;
        const serverQueue = queue.get(message.guild.id);

        if (!message.member.voice.channel) {
            return message.reply('❌ You must be in the voice channel!');
        }
        if (!serverQueue) {
            return message.reply('❌ Nothing is playing.');
        }

        const volume = Number(args[0]);

        if (!volume || volume < 1 || volume > 1000) {
            return message.reply(`🔊 Current volume: **${serverQueue.volume}%**\nTo change, type: \`!volume <1-1000>\``);
        }

        try {
            // Встановлюємо гучність у плеєрі Lavalink
            await serverQueue.player.setGlobalVolume(volume);
            serverQueue.volume = volume; // Зберігаємо в пам'яті
            message.reply(`🔊 Volume changed to **${volume}%**`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Failed to change volume.');
        }
    }
};