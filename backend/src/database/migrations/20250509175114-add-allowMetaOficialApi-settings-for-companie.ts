import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface, dataTypes: typeof DataTypes)=> {
   return  queryInterface.addColumn('CompaniesSettings', 'allowMetaOficialApi', {
      type: dataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  down: async (queryInterface: QueryInterface, dataTypes: typeof DataTypes) => {
    return  queryInterface.removeColumn('CompaniesSettings', 'allowMetaOficialApi');
  },
};
