import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "tokenWhats", {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.addColumn("Users", "userWhats", {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
      })
    ])
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "tokenWhats"),
      queryInterface.removeColumn("Users", "userWhats")
    ]) 
  }
};
