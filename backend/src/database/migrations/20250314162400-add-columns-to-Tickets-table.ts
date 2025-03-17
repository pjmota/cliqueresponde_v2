import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "typebotId", {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: true
      }),
      queryInterface.addColumn("Tickets", "promptId", {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Tickets", "typebotResultId", {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: true
      }),
      queryInterface.addColumn("Tickets", "typebotUrl", {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: true
      }),
      queryInterface.addColumn("Tickets", "typebotToken", {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: true
      }),
      queryInterface.addColumn("Tickets", "startedByPlatform", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      })
    ])
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "typebotId"),
      queryInterface.removeColumn("Tickets", "promptId"),
      queryInterface.removeColumn("Tickets", "typebotResultId"),
      queryInterface.removeColumn("Tickets", "typebotUrl"),
      queryInterface.removeColumn("Tickets", "typebotToken"),
      queryInterface.removeColumn("Tickets", "startedByPlatform")
    ])
  }
};
