'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Comment.hasMany(models.Post, {
        foreignKey: 'comments'
      });
    }
  };
  Comment.init({
    comment_id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    author: DataTypes.STRING,
    comment: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};