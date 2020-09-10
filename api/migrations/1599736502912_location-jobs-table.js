/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('Locations_Jobs', {
    id: 'id',
    updateTime: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    locationId: {
      type: 'integer',
      notNull: true,
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('Locations_Jobs', { ifExists: true });
};
