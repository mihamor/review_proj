/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`INSERT INTO "Accounts" (name, id) VALUES
  ('Alpha Manager', 1), ('Beta Owner', 2), ('Gamma Employee', 3);`)
};

exports.down = pgm => {
  pgm.sql(`DELETE FROM "Accounts" WHERE id IN (1, 2, 3);`)
};
