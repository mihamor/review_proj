/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('Accounts', {
    id: 'id',
    name: {
      type: 'text',
      notNull: true,
    },
  });
  pgm.createTable('AccountsLocations', {
    accountId: {
      type: 'integer',
      references: '"Accounts"',
      onDelete: 'cascade',
      notNull: true,
    },
    locationId: {
      type: 'integer',
      references: '"Locations"',
      onDelete: 'cascade',
      notNull: true,
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('AccountsLocations', { ifExists: true });
  pgm.dropTable('Accounts', { ifExists: true });
};
