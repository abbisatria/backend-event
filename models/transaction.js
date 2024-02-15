'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Transaction.belongsTo(models.Customer, { foreignKey: 'id_customer' })
      Transaction.belongsTo(models.DetailEvent, { foreignKey: 'id_detail_event' })
      Transaction.belongsTo(models.User, { foreignKey: 'id_user' })
    }
  }
  Transaction.init({
    id_customer: DataTypes.INTEGER,
    id_detail_event: DataTypes.INTEGER,
    id_user: DataTypes.INTEGER,
    status: DataTypes.STRING,
    quantity: DataTypes.FLOAT,
    upload_proof_transaction: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transaction'
  })
  return Transaction
}
