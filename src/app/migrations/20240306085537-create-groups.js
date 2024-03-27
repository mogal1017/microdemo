'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tenant_id: {
        type: Sequelize.INTEGER
      },
      group_name: {
        type: Sequelize.STRING
      },
      short_bio: {
        type: Sequelize.STRING
      },
      email_address: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.JSON
      },
      is_private: {
        type: Sequelize.INTEGER
      },
      is_secure: {
        type: Sequelize.INTEGER
      },
      enable_posting: {
        type: Sequelize.INTEGER
      },
      chat_group_history: {
        type: Sequelize.STRING
      },
      resource: {
        type: Sequelize.JSON
      },
      created_by: {
        type: Sequelize.INTEGER
      },
      is_active: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('groups');
  }
};