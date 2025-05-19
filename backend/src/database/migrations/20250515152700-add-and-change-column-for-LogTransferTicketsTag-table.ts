import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar a coluna 'contacts'
    await queryInterface.addColumn("LogTransferTicketsTag", "contacts", {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Alterar a coluna 'tickets' para permitir null
    await queryInterface.changeColumn("LogTransferTicketsTag", "tickets", {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover a coluna 'contacts'
    await queryInterface.removeColumn("LogTransferTicketsTag", "contacts");

    // Reverter a coluna 'tickets' para NOT NULL
    await queryInterface.changeColumn("LogTransferTicketsTag", "tickets", {
      type: DataTypes.STRING,
      allowNull: false
    });
  }
};