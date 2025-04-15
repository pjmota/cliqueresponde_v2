import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "scheduleSendAt", {
        type: DataTypes.DATE,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "scheduleNotifyBeforeText", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "scheduleNotifyBefore", {
        type: DataTypes.INTEGER,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "scheduleNotifyNowText", {
        type: DataTypes.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "scheduleSendAt"),
      queryInterface.removeColumn("Users", "scheduleNotifyBeforeText"),
      queryInterface.removeColumn("Users", "scheduleNotifyBefore"),
      queryInterface.removeColumn("Users", "scheduleNotifyNowText")
    ]);
  }
};
