'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class group_members extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  group_members.init({
    group_id: DataTypes.INTEGER,
    member_id: DataTypes.INTEGER,
    is_admin: DataTypes.INTEGER,
    is_invited: DataTypes.INTEGER,
    invited_by: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    is_request_to_admin: DataTypes.INTEGER,
    request_status: DataTypes.INTEGER,
    approved_by: DataTypes.INTEGER,
    approved_at: DataTypes.DATE,
    join_at: DataTypes.INTEGER,
    mute_notification: DataTypes.INTEGER,
    flag_group: DataTypes.INTEGER,
    is_active: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'group_members',
  });
  return group_members;
};