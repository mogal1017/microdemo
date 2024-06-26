'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class save_posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  save_posts.init({
    post_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    user_data: DataTypes.JSON,
    is_active: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'save_posts',
  });
  return save_posts;
};