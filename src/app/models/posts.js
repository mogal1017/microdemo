'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  posts.init({
    tenant_id: DataTypes.INTEGER,
    reposted_from: DataTypes.INTEGER,
    reposted_post_reference: DataTypes.INTEGER,
    repost_thoughts: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    user_data: DataTypes.JSON,
    type_of_post: DataTypes.INTEGER,
    sub_type: DataTypes.INTEGER,
    visibility_setting: DataTypes.INTEGER,
    is_group_post: DataTypes.INTEGER,
    group_id: DataTypes.INTEGER,
    content_text: DataTypes.STRING,
    content_file: DataTypes.JSON,
    background_color: DataTypes.STRING,
    template_text: DataTypes.STRING,
    like: DataTypes.JSON,
    comment_count: DataTypes.INTEGER,
    repost: DataTypes.JSON,
    share: DataTypes.JSON,
    turn_on_off_comment: DataTypes.INTEGER,
    is_active: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'posts',
  });
  return posts;
};