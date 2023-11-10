const { createAudioResource,AudioPlayerStatus } = require("@discordjs/voice");
const { createAudioPlayer } = require("@discordjs/voice");
const { PlayerSubscription } = require("@discordjs/voice");
const { joinVoiceChannel, VoiceConnection } = require("@discordjs/voice");
const { GuildChannel } = require("discord.js");
let isPlaying = false;
const player = require("play-dl");


let connection;

let subscriber;

module.exports = {

  //JOIN
  joinChannel: async (channel) => {
    if (connection != null) {
      throw new Error("Already connected to a voice channel");
    }

    connection = joinVoiceChannel({
      guildId: channel.guildId,
      channelId: channel.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });
    const player = connection.subscribe(createAudioPlayer());
    subscriber = player;
  },
//LEAVE
  leave: async () => {
    connection?.destroy();
    connection = null;
  },

  myVc: () => connection?.joinConfig.channelId,
//PLAY
  play: async (song) => {
    let searches = [];
    isPlaying = true;
    searches.push(player.search(song, {
      fuzzy: true
    }).catch(() => null));

    const result = (await Promise.all(searches)).find((x) => x != null);

    if (!result || result?.length == 0) {
      throw new Error("No Music Found");
    }

    let stream = await player.stream(result[0].url);

    stream.pause();

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true,
    });
    resource.volume?.setVolume(2);

    subscriber.player.play(resource);
    return { result };
  },
  //PAUSE
 pause: () => {
    if (subscriber && subscriber.player && subscriber.player.state.status === AudioPlayerStatus.Playing) {
      subscriber.player.pause();

      
      isPlaying = false;
    }
  },

  //RESUME
  resume: () => {
    if (subscriber && subscriber.player && subscriber.player.state.status === AudioPlayerStatus.Paused) {
      subscriber.player.unpause();

            isPlaying = true;
    }
  },

  //IS PLAYING?
  isPlaying: () => {
    return isPlaying;
  },
  //VOLUME
  setVolume: (volume) => {
    if (subscriber && subscriber.player) {
      if (volume < 0) volume = 0;
      if (volume > 10) volume = 10;
      subscriber.player.state.resource.volume?.setVolume(volume);
    }
  }

}