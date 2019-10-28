module.exports = {
  dialect: 'mysql',
  port: 3305,
  host: 'localhost',
  username: 'root',
  password: 'docker',
  database: 'gympoint',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
