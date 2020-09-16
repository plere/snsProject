'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here      
    }
  };
  Post.init({
    post_id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
    author: DataTypes.STRING,
    picture: DataTypes.STRING,
    contents: DataTypes.STRING,
    like: DataTypes.INTEGER,
    comments: DataTypes.ARRAY(DataTypes.INTEGER)
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};