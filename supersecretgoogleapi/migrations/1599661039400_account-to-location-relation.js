/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumns("Locations", {
    accountId: {
      type: 'serial',
      notNull: true,
      references: '"Accounts"',
      onDelete: 'cascade'
    }
  }, {
    ifNotExists: true,
  });
};

exports.down = pgm => {
  pgm.dropColumns("Locations", "accountId", {
    ifExists: true,
  });
};
