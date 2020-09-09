/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('ReviewReplies', {
    id: 'id',
    comment: {
      type: 'timestamp',
      notNull: true,
    },
    updateTime: {
      type: 'timestamp',
      notNull: true,
    },
  });

  pgm.createTable('Reviewers', {
    id: 'id',
    profilePhotoUrl: {
      type: 'text',
    },
    displayName: {
      type: 'text'
    },
    isAnonymous: {
      type: 'boolean',
      notNull: true,
    },
  });

  pgm.createTable('Reviews', {
    id: 'id',
    locationId: {
      type: 'serial',
      notNull: true,
      references: '"Locations"',
      onDelete: 'cascade'
    },
    reviewer: {
      type: 'serial',
      notNull: true,
      references: '"Reviewers"',
      onDelete: 'cascade'
    },
    starRating: {
      type: 'text',
      notNull: true,
    },
    comment: {
      type: 'text',
      notNull: true,
    },
    createTime: {
      type: 'timestamp',
      notNull: true,
    },
    updateTime: {
      type: 'timestamp',
      notNull: true,
    },
    reviewReply: {
      type: 'serial',
      notNull: true,
      references: '"ReviewReplies"',
      onDelete: 'cascade'
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('Reviews', { ifExists: true });
  pgm.dropTable('ReviewReplies', { ifExists: true });
  pgm.dropTable('Reviewers', { ifExists: true });
};
