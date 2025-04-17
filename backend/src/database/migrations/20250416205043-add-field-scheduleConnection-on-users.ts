import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "scheduleConnection", {
      type: DataTypes.INTEGER, // Novo tipo INTEGER
      allowNull: true,
      defaultValue: null,
      references: {
        model: "Whatsapps", // Nome da tabela referenciada
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
      
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "scheduleConnection");
  }
};