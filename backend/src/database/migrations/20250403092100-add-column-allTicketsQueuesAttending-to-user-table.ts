import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "allTicketsQueuesAttending", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "disable"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "allTicketsQueuesAttending");
  }
};
