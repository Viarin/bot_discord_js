module.exports = {
    name: 'skip',
    description: 'Skip the current song',
    execute(message, args) {
        const queue = message.client.queue;
        const serverQueue = queue.get(message.guild.id);

        if (!message.member.voice.channel) {
            return message.reply('❌ You must be in the voice channel!');
        }
        if (!serverQueue) {
            return message.reply('❌ Nothing is playing.');
        }

        // Зупинка треку викликає подію 'end', яка запустить наступний
        serverQueue.player.stopTrack();
        message.reply('⏭️ Song skipped!');
    }
};