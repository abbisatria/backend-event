'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class DetailEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      DetailEvent.belongsTo(models.Event, { foreignKey: 'id_event' })
    }
  }
  DetailEvent.init({
    id_event: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    type_ticket: DataTypes.STRING,
    quantity_ticket: DataTypes.FLOAT,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'DetailEvent'
  })
  return DetailEvent
}
