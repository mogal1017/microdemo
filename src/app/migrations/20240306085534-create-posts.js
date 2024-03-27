'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tenant_id: {
        type: Sequelize.INTEGER
      },
      reposted_from: {
        type: Sequelize.INTEGER
      },
      reposted_post_reference: {
        type: Sequelize.INTEGER
      },
      repost_thoughts: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      user_data: {
        type: Sequelize.JSON
      },
      type_of_post: {
        type: Sequelize.INTEGER
      },
      sub_type: {
        type: Sequelize.INTEGER
      },
      visibility_setting: {
        type: Sequelize.INTEGER
      },
      is_group_post: {
        type: Sequelize.INTEGER
      },
      group_id: {
        type: Sequelize.INTEGER
      },
      content_text: {
        type: Sequelize.STRING
      },
      content_file: {
        type: Sequelize.JSON
      },
      background_color: {
        type: Sequelize.STRING
      },
      template_text: {
        type: Sequelize.STRING
      },
      like: {
        type: Sequelize.JSON
      },
      comment_count: {
        type: Sequelize.INTEGER
      },
      repost: {
        type: Sequelize.JSON
      },
      share: {
        type: Sequelize.JSON
      },
      turn_on_off_comment: {
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
    await queryInterface.dropTable('posts');
  }
};