import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.createTable("LogTransferTicketsTag", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      currentTagId: {
        type: DataTypes.INTEGER,
        references: { model: "Tags", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      nextTagId: {
        type: DataTypes.INTEGER,
        references: { model: "Tags", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      tickets: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("LogTransferTicketsTag");
  }
};
