module.exports = {
    name: 'q', // або 'queue'
    description: 'List of songs in the queue',
    execute(message, args) {
        const serverQueue = message.client.queue.get(message.guild.id);

        if (!serverQueue || serverQueue.songs.length === 0) {
            return message.reply('📭 Queue is empty.');
        }

        const currentTrack = serverQueue.songs[0];
        const tracks = serverQueue.songs.slice(1, 11); 
        
        let queueString = `**🔥 Now Playing:**\n${currentTrack.info.title}\n\n**UP NEXT:**\n`;

        if (tracks.length > 0) {
            queueString += tracks.map((track, index) => {
                return `**${index + 1}.** ${track.info.title} \`[${formatTime(track.info.length)}]\``;
            }).join('\n');
        } else {
            queueString += '*No more songs in the queue...*';
        }

       
        if (serverQueue.songs.length > 11) {
            queueString += `\n\n*...and ${serverQueue.songs.length - 11} more songs.*`;
        }

        message.channel.send(queueString);
    }
};


function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}