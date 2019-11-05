module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('plans', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      default: null,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('plans', 'deleted_at');
  },
};
