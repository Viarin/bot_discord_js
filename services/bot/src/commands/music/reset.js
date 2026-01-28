module.exports = {
    name: 'reset',
    description: 'Restarts the player (!reset or !reset save)',
    async execute(message, args) {
        const queue = message.client.queue;
        const guildId = message.guild.id;
        const serverQueue = queue.get(guildId);

        if (!message.member.voice.channel) {
            return message.reply('❌ You must be in a voice channel to reset the player!');
        }
        if (!serverQueue) {
            return message.reply('❌ Nothing is playing right now, nothing to reset.');
        }

        const mode = args[0]?.toLowerCase();

        // --- (!reset) ---
        if (mode !== 'save') {
            serverQueue.player.stopTrack();
            message.client.shoukaku.leaveVoiceChannel(guildId);
            queue.delete(guildId);
            return message.reply('💥 **Full reset!** Player stopped, queue cleared.');
        }

        // -- (!reset save) ---
        message.reply('🔄 **Restarting player...** (Queue preserved)');
        const savedSongs = [...serverQueue.songs]; 
        const savedVolume = serverQueue.volume || 100;
        const voiceChannelId = serverQueue.voiceChannel.id;
        const textChannel = serverQueue.textChannel;

        
        try {
            message.client.shoukaku.leaveVoiceChannel(guildId);
            queue.delete(guildId);
        } catch (e) {
            console.error("Error:", e);
        }

        
        await new Promise(resolve => setTimeout(resolve, 1000));

       
        try {
            const player = await message.client.shoukaku.joinVoiceChannel({
                guildId: guildId,
                channelId: voiceChannelId,
                shardId: 0,
                deaf: true
            });

            
            player.on('start', () => {});
            player.on('end', () => {
                const currentQueue = message.client.queue.get(guildId);
                if (currentQueue) {
                    currentQueue.songs.shift();
                    // ТУТ ВАЖЛИВО: Нам треба функцію playSong. 
                    // Оскільки ми в іншому файлі, ми її продублюємо або імпортуємо.
                    // Для простоти - викличемо її через require play.js (трохи костиль, але працює)
                    const playCommand = message.client.commands.get('play');
                    // Викликаємо внутрішню функцію playSong з файлу play.js, якщо експортуємо її, 
                    // АЛЕ простіше продублювати логіку запуску тут, щоб не ламати структуру.
                    playNext(message.guild, currentQueue.songs[0]); 
                }
            });
            player.on('closed', () => message.client.queue.delete(guildId));

            player.setGlobalVolume(savedVolume);

           
            const newQueueConstruct = {
                textChannel: textChannel,
                voiceChannel: serverQueue.voiceChannel,
                player: player,
                songs: savedSongs, 
                volume: savedVolume,
                playing: true
            };

            queue.set(guildId, newQueueConstruct);

            
            playNext(message.guild, savedSongs[0]);
            
            message.channel.send('✅ Player restarted! Continuing playback.');

        } catch (error) {
            console.error(error);
            message.reply('❌ Failed to rejoin the voice channel: ' + error.message);
        }
    }
};


async function playNext(guild, song) {
    const serverQueue = guild.client.queue.get(guild.id);
    if (!serverQueue || !song) return;

    try {
        await serverQueue.player.playTrack({ track: { encoded: song.encoded } });
    } catch (error) {
        console.error("Error resuming:", error);
    }
}