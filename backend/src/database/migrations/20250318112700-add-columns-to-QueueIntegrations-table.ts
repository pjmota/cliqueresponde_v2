import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("QueueIntegrations", "typebotUrlServer", {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: true
      }),
      queryInterface.addColumn("QueueIntegrations", "typebotKeywordStart", {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: true
      }),
    ])
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("QueueIntegrations", "typebotUrlServer"),
      queryInterface.removeColumn("QueueIntegrations", "typebotKeywordStart")
    ])
  }
};