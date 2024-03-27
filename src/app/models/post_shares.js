'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post_shares extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  post_shares.init({
    post_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    user_data: DataTypes.JSON,
    share_to: DataTypes.INTEGER,
    individual_id: DataTypes.INTEGER,
    group_id: DataTypes.INTEGER,
    broadcast_id: DataTypes.INTEGER,
    is_active: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'post_shares',
  });
  return post_shares;
};