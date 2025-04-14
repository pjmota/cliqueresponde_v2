import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Schedules", "type", {
      type: DataTypes.STRING,
      defaultValue: 'SCHEDULE',
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Schedules", "type");
  }
};