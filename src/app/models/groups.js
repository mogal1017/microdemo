'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  groups.init({
    tenant_id: DataTypes.INTEGER,
    group_name: DataTypes.STRING,
    short_bio: DataTypes.STRING,
    email_address: DataTypes.STRING,
    website: DataTypes.JSON,
    is_private: DataTypes.INTEGER,
    is_secure: DataTypes.INTEGER,
    enable_posting: DataTypes.INTEGER,
    chat_group_history: DataTypes.STRING,
    resource: DataTypes.JSON,
    created_by: DataTypes.INTEGER,
    is_active: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'groups',
  });
  return groups;
};