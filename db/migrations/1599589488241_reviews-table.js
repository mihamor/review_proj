/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('ReviewReplies', {
    id: {
      type: 'text',
      notNull: true,
      primaryKey: true,
    },
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
    id: {
      type: 'text',
      notNull: true,
      primaryKey: true,
    },
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
    reviewId: {
      type: 'text',
      notNull: true,
      primaryKey: true,
    },
    locationId: {
      type: 'text',
      notNull: true,
      references: '"Locations"',
      onDelete: 'cascade'
    },
    reviewer: {
      type: 'text',
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
      type: 'text',
      notNull: true,
      references: '"ReviewReplies"',
      onDelete: 'cascade'
    },
  });
};

exports.down = pgm => {};
