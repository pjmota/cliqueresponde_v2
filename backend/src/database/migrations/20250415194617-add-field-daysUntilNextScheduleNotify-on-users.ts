import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "daysUntilNextScheduleNotify", {
      type: DataTypes.INTEGER, // Novo tipo INTEGER
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "daysUntilNextScheduleNotify");
  }
};