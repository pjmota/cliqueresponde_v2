import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("LogRoulettes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rotationId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      lastSequence: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      queueId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      queueName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      queueRouletteActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contactNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      whatsappName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: false
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

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("LogRoulettes");
  }
};
