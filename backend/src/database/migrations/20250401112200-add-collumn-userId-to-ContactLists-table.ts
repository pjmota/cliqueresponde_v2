import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ContactLists", "userId", {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ContactLists", "userId");
  }
};