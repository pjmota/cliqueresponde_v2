import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.bulkInsert(
          "Permissions",
          [
            {
              name: "Atendimento",
              code: "atendimento",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              name: "Kanban",
              code: "kanban",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              name: "Respostas Rápidas",
              code: "respostas-rapidas",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              name: "Contatos",
              code: "contatos",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              name: "Agendamentos",
              code: "agendamentos",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              name: "Chat Interno",
              code: "chat-interno",
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              name: "Campanhas",
              code: "campanhas",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          { transaction: t }
        )
      ]);
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.bulkDelete("Permissions", {})
    ]);
  }
};
