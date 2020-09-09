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
  pgm.createTable('Accounts_Locations', {
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
  pgm.dropTable('Accounts_Locations', { ifExists: true });
  pgm.dropTable('Accounts', { ifExists: true });
};
