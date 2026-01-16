module.exports = {
    name: 'stop',
    description: 'Stop music and leave',
    execute(message, args) {
        const queue = message.client.queue;
        const serverQueue = queue.get(message.guild.id);

        if (!message.member.voice.channel) {
            return message.reply('❌ You must be in the voice channel!');
        }
        if (!serverQueue) {
            return message.reply('❌ Nothing is playing.');
        }

        // clear the queue
        serverQueue.songs = [];
        // Зупиняємо трек і розриваємо з'єднання
        serverQueue.player.stopTrack();
        message.client.shoukaku.leaveVoiceChannel(message.guild.id);
        
        // Видаляємо з пам'яті
        queue.delete(message.guild.id);
        
        message.reply('🛑 Music stopped, queue cleared.');
    }
};