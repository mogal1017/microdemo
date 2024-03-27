'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_wise_social_video_states extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_wise_social_video_states.init({
    tenant_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    user_data: DataTypes.JSON,
    user_source: DataTypes.INTEGER,
    ref_id: DataTypes.INTEGER,
    duration: DataTypes.TIME,
    total_video_duration: DataTypes.TIME,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_wise_social_video_states',
  });
  return user_wise_social_video_states;
};