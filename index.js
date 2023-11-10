// JOIN THE SERVER IF YOU NEED ANY HELP REGARDING THE BOT -> https://discord.gg/VRpY9PbuXF

// INSERT YOUR BOT TOKEN BELOW


const TOKEN = '';
//GUYS SERVERS ARE GETTING NUKED IF YOU LEAVE YOUR TOKEN OUT IN THE OPEN, PLEASE TAKE CARE TO HIDE YOUR TOKEN USING THIS VIDEO:
//https://youtu.be/z_NSEb-nhjg

const Discord = require("discord.js");
const REST = Discord.REST;
const Routes = Discord.Routes;
const player = require("./player");
const client = new Discord.Client({
  intents: [
    ...(Object.keys(Discord.IntentsBitField.Flags).filter((k) => !(Number(k) > 0)))
  ]

});

client.login(TOKEN);
//PUT THE 24/7 CODE BELOW THIS LINE

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);

  const rest = new REST().setToken(TOKEN);

  await rest.put(Routes.applicationCommands(client.user.id), {
    body: [
      new Discord.SlashCommandBuilder()
        .setName("leave")
        .setDescription("Leaves the voice channel")
        .setDMPermission(false),
      new Discord.SlashCommandBuilder()
        .setName("play")
        .setDescription("Plays a song")
        .addStringOption((option) => option.setName("song").setDescription("The song to search for").setRequired(true)),
      new Discord.SlashCommandBuilder()
        .setName("volume")
        .setDescription("Adjust the volume of the music playback")
        .addIntegerOption((option) =>
          option
            .setName("level")
            .setDescription("Volume level (0 to 10)")
            .setRequired(true)
        )
        .setDMPermission(false),
      new Discord.SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause the music playback"),

      // Resume command
      new Discord.SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume the music playback"),
      new Discord.SlashCommandBuilder()
        .setName('help')
        .setDescription('Here are all of my commands!'),
    ].map((k) => k.toJSON())
  });

  console.log("✅ Slash Commands Loaded Successfully");
  console.log("\nPLEASE HIDE YOUR TOKEN BEFORE SOMEONE MISUSES IT -> https://youtu.be/z_NSEb-nhjg");
});

client.on("interactionCreate", async (i) => {
  await i.deferReply();
  if (i.isCommand()) {

    //THE PLAY COMMAND
    if (i.commandName == "play") {
      const voice = i.member?.voice;

      if ((voice.channelId || "").length != "1093619503658709012".length) {
        await i.editReply({
          embeds: [{
            title: ('Error'),
            description: ('We need to be in the same vc to play music uk...(Also if you are in a vc, please use `/leave` then `/play` again!')
          }],
        });
        return;
      }


      if (!voice.channel.joinable) {
        await i.editReply({
          embeds: [{
            title: ('Error'),
            description: ('I can\'t join your voice channel!')
          }],
        });
        return;
      }

      try {
        await player.joinChannel(voice.channel);

      } catch (_) {

      }

      const myVoiceChannel = player.myVc();


      if (myVoiceChannel == null) {
        await i.editReply({
          embeds: [{
            title: ('Error'),
            description: ('Either i am in a voice channel but just restarted, or i\'m not in a voice channel, in any case, please run `/join`')
          }],
        });
        return;
      }

      if (voice.channelId != myVoiceChannel) {
        await i.editReply({
          embeds: [{
            title: ('Error'),
            description: ('You are not in the same voice channel as me!')
          }],
        });
        return;
      }
      const result = require('./player.js');
      const song = i.options.getString("song");

      try {
        const { result, youtubeUrl } = await player.play(song);
        console.log(`Now playing ${result[0].title}`)
        const songName = result[0].title;
        const duration = result[0].durationRaw
        const url = result[0].url;
        const description = result[0].description;
        const artist = result[0].channel;
        const artistUrl = result[0].channel.url;
        const thumbnail = result[0].thumbnails[0].url;
        const icon = result[0].channel.icons[0].url;

        await i.editReply({
          embeds: [{
            title: String('Now Playing:'),
            thumbnail: {
              url: String(icon)
            },
            fields: [{
              name: 'Video:',
              value: (`[${songName}](${url})`),
              inline: false,
            },
            {
              name: 'By:',
              value: (`[${artist}](${artistUrl})`),
              inline: true,
            },
            {
              name: 'Duration:',
              value: duration,
              inline: true,
            },

            ],
            image: {
              url: String(thumbnail)
            },
            footer: {
              text: `Requested by ${i.user.username}`,
              icon_url: i.user.displayAvatarURL({ format: "png" })
            }
          }],


        });


      } catch (e) {
        console.log(e)
        await i.editReply({
          embeds: [{
            title: ('Error'),
            description: ('I had trouble getting the song, please try again.')
          }],
        });



      }
      //THE LEAVE COMMAND
    } else if (i.commandName == "leave") {
      await player.leave();

      await i.editReply({
        embeds: [{
          title: ('Leaving...'),
          description: ('Left the voice channel...')
        }],
      });
    }
    //THE VOLUME COMMAND
    else if (i.commandName == "volume") {
      const volumeLevel = i.options.getInteger("level");
      if (volumeLevel > 10) {
        try {
          await player.setVolume(10);
          await i.editReply({
            embeds: [{
              title: ('Volume changed'),
              description: ('Max volume level is `10` \nVolume set to `10`')
            }],
          });
        } catch (e) {
          console.log(e);
          await i.editReply(String(e));
        }

      } else if (volumeLevel < 0) {
        try {
          await player.setVolume(0);
          await i.editReply({
            embeds: [{
              title: ('Volume changed'),
              description: ('Min volume level is `0` \nVolume set to `0`')
            }],
          });
        } catch (e) {
          console.log(e);
          await i.editReply(String(e));
        }
      }
      else {
        try {

          await player.setVolume(volumeLevel);
          await i.editReply({
            embeds: [{
              title: ('Volume changed'),
              description: (`Volume set to \`${volumeLevel}\``)
            }],
          });
        } catch (e) {
          console.log(e);
          await i.editReply({
            embeds: [{
              title: ('Error'),
              description: ('An error occurred, please try again.')
            }],
          })
        }
      }
      //THE PAUSE COMMAND
    } else if (i.commandName == "pause") {
      try {

        if (player.isPlaying()) {

          player.pause();
          await i.editReply({
            embeds: [{
              title: ('Paused'),
              description: ('Paused the music.')
            }],
          });
        } else {
          await i.editReply({
            embeds: [{
              title: ('Error'),
              description: ('There is no music playing to pause.')
            }],
          });
        }
      } catch (e) {
        console.error(e);
        await i.editReply({
          embeds: [{
            title: ('Error'),
            description: ('An error occurred while pausing playback.')
          }],
        });
      }
    }
    //THE RESUME COMMAND
    else if (i.commandName == "resume") {
      try {
        if (!player.isPlaying()) {
          player.resume();
          await i.editReply({
            embeds: [{
              title: ('Resumed'),
              description: ('Resumed the music.')
            }],
          });
        } else {
          await i.editReply({
            embeds: [{
              title: ('Error'),
              description: ('There is no paused music to resume.')
            }],
          });
        }
      } catch (e) {
        console.error(e);
        await i.editReply({
          embeds: [{
            title: ('Error'),
            description: ('An error occurred while pausing playback.')
          }],
        });
      }
    } else if (i.commandName == "help") {
      await i.editReply({
        embeds: [{
          title: String('Help is here!'),
          thumbnail: {
            url: client.user.displayAvatarURL({ format: "png" })
          },
          color: 0xde02fc,
          description: String('Use a `/` before the following commands to use them:'),
          fields: [
            {
              name: 'help',
              value: ('Lists command list'),
              inline: true,
            }, {
              name: 'play',
              value: (`Plays a song`),
              inline: true,
            },
            {
              name: 'volume',
              value: ('Changes volume level'),
              inline: true,
            },
            {
              name: 'pause',
              value: ('Pauses the music'),
              inline: true,
            },
            {
              name: 'resume',
              value: ('Resumes the music'),
              inline: true,
            },
            {
              name: 'leave',
              value: ('Leaves voice channel'),
              inline: true,
            },


          ],
          footer: {
            text: `Requested by ${i.user.username}`,
            icon_url: i.user.displayAvatarURL({ format: "png" })
          }
        }],


      });
      await i.user.send('Here\'s the server link if you need any help: https://discord.gg/VRpY9PbuXF')
    }
  }
});