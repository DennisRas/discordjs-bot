const path = require("path");
const Sequelize = require("sequelize");

const instance = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve("data", "database.sqlite"),
});

const TagsModel = instance.define("tags", {
  name: {
    type: Sequelize.STRING,
    unique: true,
  },
  description: Sequelize.TEXT,
  username: Sequelize.STRING,
  usage_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = {
  instance,
  TagsModel,
  sync: function () {
    TagsModel.sync();
  },
};
