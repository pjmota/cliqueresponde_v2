import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("QueueIntegrations", "typebotToken", {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("QueueIntegrations", "typebotToken");
  }
};