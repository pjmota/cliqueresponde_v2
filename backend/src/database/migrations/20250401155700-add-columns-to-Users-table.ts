import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "sendWhatsAppInLeadMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "leadMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ])
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "sendWhatsAppInLeadMessage"),
      queryInterface.removeColumn("Users", "leadMessage")
    ]) 
  }
};

