'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post_comment_reactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  post_comment_reactions.init({
    post_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    user_data: DataTypes.JSON,
    type: DataTypes.INTEGER,
    comment_reference: DataTypes.INTEGER,
    reactions: DataTypes.INTEGER,
    comment_content: DataTypes.STRING,
    is_active: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'post_comment_reactions',
  });
  return post_comment_reactions;
};