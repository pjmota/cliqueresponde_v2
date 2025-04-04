import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ChatMessages", "mediaUrl", {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ChatMessages", "mediaUrl");
  }
};