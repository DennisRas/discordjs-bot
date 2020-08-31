const { TagsModel } = require("../database");

module.exports = {
  name: "tag",
  description: "Tag",
  aliases: ["tags"],
  args: true,
  async execute(message, args) {
    const subCommand = args[0].toLowerCase();

    if (typeof subCommands[subCommand] === "function") {
      return await subCommands[subCommand](message, args.slice(1));
    }

    if (!args[0]) {
      return message.reply(`Tag required.`);
    }

    const tag = await TagsModel.findOne({ where: { name: args[0] } });

    if (tag) {
      tag.increment("usage_count");
      return message.channel.send(`Tagged ${args[0]}`);
    }

    return message.reply(`Could not find a tag with name ${args[0]}.`);
  },
};

const subCommands = {
  add: async function (message, args) {
    if (!args[0]) {
      return message.reply(`Tag required.`);
    }
    try {
      await TagsModel.create({
        name: args[0],
        description: args.join(" "),
        username: message.author.username,
      });
      return message.reply(`Tag ${args[0]} added.`);
    } catch (e) {
      if (e.name === "SequelizeUniqueConstraintError") {
        return message.reply("That tag already exists.");
      }
      return message.reply("Something went wrong with adding a tag.");
    }
  },

  edit: async function (message, args) {
    if (!args[0]) {
      return message.reply(`Tag required.`);
    }
    const affectedRows = await TagsModel.update({ description: args.join(" ") }, { where: { name: args[0] } });
    if (affectedRows > 0) {
      return message.reply(`Tag ${args[0]} was edited.`);
    }
    return message.reply(`Could not find a tag with name ${args[0]}.`);
  },

  info: async function (message, args) {
    if (!args[0]) {
      return message.reply(`Tag required.`);
    }
    const tag = await TagsModel.findOne({ where: { name: args[0] } });
    if (tag) {
      return message.channel.send(`${args[0]} was created by ${tag.username} at ${tag.createdAt} and has been tagged ${tag.usage_count} times.`);
    }
    return message.reply(`Could not find a tag with name ${args[0]}.`);
  },

  list: async function (message) {
    const tagList = await TagsModel.findAll({ attributes: ["name"] });
    const tagString = tagList.map((t) => t.name).join(", ") || "No tags set.";
    return message.channel.send(`List of tags: ${tagString}`);
  },

  remove: async function (message, args) {
    if (!args[0]) {
      return message.reply(`Tag required.`);
    }
    const rowCount = await TagsModel.destroy({ where: { name: args[0] } });
    if (rowCount > 0) {
      return message.reply("Tag deleted.");
    }
    return message.reply(`Could not find a tag with name ${args[0]}.`);
  },
};
