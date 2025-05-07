import { QueryInterface, QueryTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const permissionsToInsert = [
        {
          name: "Atendimento",
          code: "atendimento",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kanban",
          code: "kanban",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Respostas Rápidas",
          code: "respostas-rapidas",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Contatos",
          code: "contatos",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Agendamentos",
          code: "agendamentos",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chat Interno",
          code: "chat-interno",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Campanhas",
          code: "campanhas",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Tags",
          code: "tags",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Pós-venda",
          code: "pos-venda",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Verificar quais permissões já existem
      const existingPermissions = await queryInterface.sequelize.query<{ code: string }>(
        `SELECT code FROM "Permissions" WHERE code IN (:codes)`,
        {
          replacements: { codes: permissionsToInsert.map((p) => p.code) },
          type: QueryTypes.SELECT,
          transaction: t,
        }
      );

      const existingCodes = existingPermissions.map((p) => p.code);

      // Filtrar permissões que ainda não existem
      const permissionsToCreate = permissionsToInsert.filter(
        (permission) => !existingCodes.includes(permission.code)
      );

      // Inserir apenas as permissões que não existem
      if (permissionsToCreate.length > 0) {
        return queryInterface.bulkInsert("Permissions", permissionsToCreate, {
          transaction: t,
        });
      }

      return Promise.resolve(); // Retorna uma promessa resolvida se nada for inserido
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (t) => {
      return queryInterface.bulkDelete(
        "Permissions",
        {
          code: [
            "atendimento",
            "kanban",
            "respostas-rapidas",
            "contatos",
            "agendamentos",
            "chat-interno",
            "campanhas",
            "tags",
            "pos-venda"
          ],
        },
        { transaction: t }
      );
    });
  },
};