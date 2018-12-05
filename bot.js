const botconfig = require("./botconfig.json");
const Discord = require('discord.js');
const client = new Discord.Client();
const author = ["420227609163595777"];
const bot = new Discord.Client({disableEveryone: true});
var warned = [];
var banned = [];
var messagelog = [];


client.on('ready', () => {
  console.log('BOT STARTED UP!');
  client.user.setGame("Dont even think to break roles", "https://www.twitch.tv/ninja");
  console.log(`${client.user.tag} running on ${client.guilds.size} guilds with ${client.users.size} users.`);
   });
/**
 * Add simple spam protection to your discord server.
 * @param  {Bot} bot - The discord.js CLient/bot
 * @param  {object} options - Optional (Custom configuarion options)
 * @return {[type]}         [description]
 */
module.exports = function (bot, options) {
  // Set options
  const warnBuffer = (options && options.warnBuffer) || 3;
  const maxBuffer = (options && options.maxBuffer) || 5;
  const interval = (options && options.interval) || 1000;
  const warningMessage = (options && options.warningMessage) || "stop spamming or I'll whack your head off.";
  const banMessage = (options && options.banMessage) || "has been banned for spamming, anyone else?";
  const maxDuplicatesWarning = (options && options. maxDuplicatesWarning || 7);
  const maxDuplicatesBan = (options && options. maxDuplicatesBan || 10);
  const deleteMessagesAfterBanForPastDays = (options && options.deleteMessagesAfterBanForPastDays || 7);
  const exemptRoles = (options && options.exemptRoles) || []
  const exemptUsers = (options && options.exemptUsers) || []

  bot.on("message", msg => {

    // bots don't ban do they?
    if (msg.author.bot) return;

    // Return immediately if user is exempt
    if(msg.member && msg.member.roles.some(r => exemptRoles.includes(r.name))) return;
    if(exemptUsers.includes(msg.author.tag)) return;

    if ( (msg.author.id != bot.user.id) && msg.channel.guild) {
      var now = Math.floor(Date.now());
      authors.push({
        "time": now,
        "author": msg.author.id
      });
      messagelog.push({
        "message": msg.content,
        "author": msg.author.id
      });

      // Check how many times the same message has been sent.
      var msgMatch = 0;
      for (var i = 0; i < messagelog.length; i++) {
        if (messagelog[i].message == msg.content && (messagelog[i].author == msg.author.id) && (msg.author.id !== bot.user.id)) {
          msgMatch++;
        }
      }
      // Check matched count
      if (msgMatch == maxDuplicatesWarning && !warned.includes(msg.author.id)) {
        warn(msg, msg.author.id);
      }
      if (msgMatch == maxDuplicatesBan && !banned.includes(msg.author.id)) {
        ban(msg, msg.author.id);
      }

      var matched = 0;

      for (var i = 0; i < authors.length; i++) {
        if (authors[i].time > now - interval) {
          matched++;
          if (matched == warnBuffer && !warned.includes(msg.author.id)) {
            warn(msg, msg.author.id);
          }
          else if (matched == maxBuffer) {
            if (!banned.includes(msg.author.id)) {
              ban(msg, msg.author.id);
            }
          }
        }
        else if (authors[i].time < now - interval) {
          authors.splice(i);
          warned.splice(warned.indexOf(authors[i]));
          banned.splice(warned.indexOf(authors[i]));
        }
        if (messagelog.length >= 200) {
          messagelog.shift();
        }
      }
    }
  });

  /**
   * Warn a user
   * @param  {Object} msg
   * @param  {string} userid userid
   */
  function warn(msg, userid) {
    warned.push(msg.author.id);
    msg.channel.send(msg.author + " " + warningMessage);
  }

  /**
   * Ban a user by the user id
   * @param  {Object} msg
   * @param  {string} userid userid
   * @return {boolean} True or False
   */
  function ban(msg, userid) {
    for (var i = 0; i < messagelog.length; i++) {
      if (messagelog[i].author == msg.author.id) {
        messagelog.splice(i);
      }
    }

    banned.push(msg.author.id);

    var user = msg.channel.guild.members.find(member => member.user.id === msg.author.id);
    if (user) {
      user.ban(deleteMessagesAfterBanForPastDays).then((member) => {
        msg.channel.send(msg.author + " " +banMessage);
        return true;
     }).catch(() => {
        msg.channel.send("insufficient permission to kick " + msg.author + " for spamming.");
        return false;
     });
    }
  }

}
    if(cmd === `${prefix}ban`){

    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return message.channel.send("Can't find user!");
    let bReason = args.join(" ").slice(22);
    if(!message.member.hasPermission("MANAGE_MEMBERS")) return message.channel.send("No can do pal!");
    if(bUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("That person can't be kicked!");

    let banEmbed = new Discord.RichEmbed()
    .setDescription("~Ban~")
    .setColor("#bc0000")
    .addField("Banned User", `${bUser} with ID ${bUser.id}`)
    .addField("Banned By", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Banned In", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", bReason);

    let incidentchannel = message.guild.channels.find(`name`, "incidents");
    if(!incidentchannel) return message.channel.send("Can't find incidents channel.");

    message.guild.member(bUser).ban(bReason);
    incidentchannel.send(banEmbed);


    return;
  }

client.login(process.env.BOT_TOKEN);