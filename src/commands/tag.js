const { TagsModel } = require("../database");

module.exports = {
  name: "tag",
  description: "Tag",
  aliases: ["tags"],
  args: true,
  async execute(message, args) {
    const subCommand = args[0].toLowerCase();
    const tagName = args[1];

    if (subCommand === "add") {
      if (!tagName) {
        return message.reply(`Tag required.`);
      }
      try {
        let tag = await TagsModel.create({
          name: tagName,
          description: args.join(" "),
          username: message.author.username,
        });
        return message.reply(`Tag ${tag.name} added.`);
      } catch (e) {
        if (e.name === "SequelizeUniqueConstraintError") {
          return message.reply("That tag already exists.");
        }
        return message.reply("Something went wrong with adding a tag.");
      }
    } else if (subCommand === "edit") {
      if (!tagName) {
        return message.reply(`Tag required.`);
      }
      const affectedRows = await TagsModel.update({ description: args.join(" ") }, { where: { name: tagName } });
      if (affectedRows > 0) {
        return message.reply(`Tag ${tagName} was edited.`);
      }
      return message.reply(`Could not find a tag with name ${tagName}.`);
    } else if (subCommand === "info") {
      if (!tagName) {
        return message.reply(`Tag required.`);
      }
      const tag = await TagsModel.findOne({ where: { name: tagName } });
      if (tag) {
        return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been tagged ${tag.usage_count} times.`);
      }
      return message.reply(`Could not find a tag with name ${tagName}.`);
    } else if (subCommand === "list") {
      const tagList = await TagsModel.findAll({ attributes: ["name"] });
      const tagString = tagList.map((t) => t.name).join(", ") || "No tags set.";
      return message.channel.send(`List of tags: ${tagString}`);
    } else if (subCommand === "remove") {
      if (!tagName) {
        return message.reply(`Tag required.`);
      }
      const rowCount = await TagsModel.destroy({ where: { name: tagName } });
      if (rowCount > 0) {
        return message.reply("Tag deleted.");
      }
      return message.reply(`Could not find a tag with name ${tagName}.`);
    } else {
      if (!args[0]) {
        return message.reply(`Tag required.`);
      }
      const tag = await TagsModel.findOne({ where: { name: args[0] } });
      if (tag) {
        tag.increment("usage_count");
        return message.channel.send(`Tagged ${args[0]}`);
      }
      return message.reply(`Could not find a tag with name ${args[0]}.`);
    }
  },
};
