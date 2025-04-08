import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn("ChatMessages", "message", "body");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn("ChatMessages", "body", "message");
  }
};