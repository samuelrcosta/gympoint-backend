module.exports = {
  up: (queryInterface, Sequelize) => {
    const migrations = [];
    migrations.push(
      queryInterface.changeColumn('enrolls', 'start_date', {
        type: Sequelize.DATEONLY,
        allowNull: false,
      })
    );
    migrations.push(
      queryInterface.changeColumn('enrolls', 'end_date', {
        type: Sequelize.DATEONLY,
        allowNull: false,
      })
    );

    return Promise.all(migrations);
  },

  down: (queryInterface, Sequelize) => {
    const migrations = [];

    migrations.push(
      queryInterface.changeColumn('enrolls', 'start_date', {
        type: Sequelize.DATE,
        allowNull: false,
      })
    );
    migrations.push(
      queryInterface.changeColumn('enrolls', 'end_date', {
        type: Sequelize.DATE,
        allowNull: false,
      })
    );

    return Promise.all(migrations);
  },
};
