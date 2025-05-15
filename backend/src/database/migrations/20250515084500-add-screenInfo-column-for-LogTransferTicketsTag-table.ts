import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface, dataTypes: typeof DataTypes)=> {
   return  queryInterface.addColumn('LogTransferTicketsTag', 'screenInfo', {
      type: dataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    return  queryInterface.removeColumn('LogTransferTicketsTag', 'screenInfo');
  },
};
