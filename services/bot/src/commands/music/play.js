const { useMainPlayer } = require('discord.js');

module.exports = {
    name: 'play',
    description: 'Play music',
    async execute(message, args) {
        // 1. Перевірки
        const { channel } = message.member.voice;
        if (!channel) return message.reply('❌ You must be in the voice channel!');
        
        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return message.reply('❌ Give me Connect and Speak permissions!');
        }

        const query = args.join(' ');
        if (!query) return message.reply('❌ Write the name of the song!');

        // 2. Пошук
        const node = message.client.shoukaku.getIdealNode();
        if (!node) return message.reply('❌ Lavalink is not ready!');

        const searchResult = await node.rest.resolve(query.startsWith('http') ? query : `ytsearch:${query}`);

        if (!searchResult || searchResult.loadType === 'empty' || searchResult.loadType === 'error') {
            return message.reply('❌ Nothing found!');
        }

        // --- ЛОГІКА ВИБОРУ ТРЕКУ ---
        let track;
        const loadType = searchResult.loadType;

        if (loadType === 'playlist') {
            track = searchResult.data.tracks[0];
        } else if (loadType === 'search' || Array.isArray(searchResult.data)) {
            track = searchResult.data[0];
        } else {
            track = searchResult.data;
        }

        if (!track || !track.encoded) {
            return message.reply('❌ Error: received corrupted track data.');
        }

        // 3. Створення плеєра
        const queue = message.client.queue;
        const guildId = message.guild.id;

        if (!queue.has(guildId)) {
            try {
                const player = await message.client.shoukaku.joinVoiceChannel({
                    guildId: guildId,
                    channelId: channel.id,
                    shardId: 0,
                    deaf: true
                });

                // Події плеєра
                player.on('start', () => {});
                
                player.on('end', () => {
                    const currentQueue = message.client.queue.get(guildId);
                    if (currentQueue) {
                        currentQueue.songs.shift();
                        playSong(message.guild, currentQueue.songs[0]);
                    }
                });

                player.on('closed', () => {
                    message.client.queue.delete(guildId);
                });
                
                // Гучність за замовчуванням
                player.setGlobalVolume(100);

                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: channel,
                    player: player,
                    songs: [],
                    volume: 100,
                    playing: true
                };

                queue.set(guildId, queueConstruct);
                queueConstruct.songs.push(track);
                playSong(message.guild, queueConstruct.songs[0]);

            } catch (error) {
                console.error(error);
                queue.delete(guildId);
                return message.reply('❌ Cannot connect: ' + error.message);
            }
        } else {
            const serverQueue = queue.get(guildId);
            serverQueue.songs.push(track);
            return message.reply(`✅ **${track.info.title}** added to the queue!`);
        }
    }
};

async function playSong(guild, song) {
    const queue = guild.client.queue;
    const serverQueue = queue.get(guild.id);

    if (!serverQueue) return;

    if (!song) {
        // quit voice channel if no songs left
        return;
    }

    try {
        await serverQueue.player.playTrack({ track: { encoded: song.encoded } });

        serverQueue.textChannel.send(`🎶 Now playing: **${song.info.title}**`);
    } catch (error) {
        console.error("Lavalink Play Error:", error);
        serverQueue.textChannel.send(`❌ Playback error: ${error.message}`);

        // Пропускаємо трек, якщо помилка
        serverQueue.songs.shift();
        playSong(guild, serverQueue.songs[0]);
    }
}