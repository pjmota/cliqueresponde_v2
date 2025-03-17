import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("TicketTags", "executedQueueIntegration", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("TicketTags", "executedQueueIntegration");
  }
};