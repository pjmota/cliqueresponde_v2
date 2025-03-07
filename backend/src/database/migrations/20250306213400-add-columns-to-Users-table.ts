import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "contactCustomFields", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "isAfterSalesManager", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "allowAfterSales", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      })
    ])
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "contactCustomFields"),
      queryInterface.removeColumn("Users", "isAfterSalesManager"),
      queryInterface.removeColumn("Users", "allowAfterSales")
    ]) 
  }
};

