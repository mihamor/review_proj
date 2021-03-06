/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('PostalAddress', {
    id: 'id',
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    regionCode: {
      type: 'text',
      notNull: true,
    },
    languageCode: {
      type: 'text',
    },
    postalCode: {
      type: 'text',
    },
    sortingCode: {
      type: 'text',
    },
    administrativeArea: {
      type: 'text',
    },
    locality: {
      type: 'text',
    },
    sublocality: {
      type: 'text',
    },
    addressLines: {
      type: 'text[]',
      notNull: true,
    },
    recipients: {
      type: 'text[]',
    },
    organization: {
      type: 'text',
    }
  });

  pgm.createTable('LocationKey', {
    id: 'id',
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    plusPageId: {
      type: 'text',
      notNull: true,
    },
    placeId: {
      type: 'text',
      notNull: true,
    },
    postalCode: {
      type: 'text',
      notNull: true,
    },
    explicitNoPlaceId: {
      type: 'text',
      notNull: true,
    },
    requestId: {
      type: 'text',
      notNull: true,
    },
  });

  pgm.createTable('BusinessHours', {
    id: 'id',
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('TimePeriods', {
    id: 'id',
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    bussinesHoursId: {
      type: 'serial',
      notNull: true,
      references: '"BusinessHours"',
      onDelete: 'cascade',
    },
    openDay: {
      type: 'text',
      notNull: true,
    },
    openTime: {
      type: 'text',
      notNull: true,
    },
    closeDay: {
      type: 'text',
      notNull: true,
    },
    closeTime: {
      type: 'text',
      notNull: true,
    },
  });

  pgm.createTable('Locations', {
    id: 'id',
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    name: {
      type: 'text',
      notNull: true,
      unuqie: true,
    },
    languageCode: {
      type: 'text',
      notNull: true,
    },
    storeCode: {
      type: 'text',
      notNull: true,
    },
    locationName: {
      type: 'text',
      notNull: true,
    },
    primaryPhone: {
      type: 'text',
      notNull: true,
    },
    additionalPhones: {
      type: 'text[]',
      notNull: true,
    },
    address: {
      type: 'serial',
      notNull: true,
      references: '"PostalAddress"',
      onDelete: 'cascade',
    },
    primaryCategory: {
      type: 'text',
      notNull: true,
    },
    additionalCategories: {
      type: 'text',
    },
    websiteUrl: {
      type: 'text'
    },
    regularHours: {
      type: 'serial',
      notNull: true,
      references: '"BusinessHours"',
      onDelete: 'cascade',
    },
    specialHours: {
      type: 'text',
    },
    serviceArea: {
      type: 'text',
    },
    locationKey: {
      type: 'serial',
      notNull: true,
      references: '"LocationKey"',
      onDelete: 'cascade',
    },
    labels: {
      type: 'text[]',
      notNull: true,
    },
    adWordsLocationExtensions: {
      type: 'text',
    },
    latlng: {
      type: 'text',
    },
    openInfo: {
      type: 'text',
    },
    locationState: {
      type: 'text',
    },
    attributes: {
      type: 'text',
    },
    metadata: {
      type: 'text',
    },
    profile: {
      type: 'text',
    },
    relationshipData: {
      type: 'text',
    }
  });

  pgm.createTable('PriceLists', {
    id: 'id',
    locationId: {
      type: 'serial',
      notNull: true,
      references: '"Locations"',
      onDelete: 'cascade',
    },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    labels: {
      type: 'text',
      notNull: true,
    },
    sourceUrl: { type: 'text' },
    sections: {
      type: 'text',
      notNull: true,
    },
  });

}

exports.down = pgm => {
  pgm.dropTable('PriceLists', { ifExists: true });
  pgm.dropTable('Locations', { ifExists: true });
  pgm.dropTable('TimePeriods', { ifExists: true });
  pgm.dropTable('BusinessHours', { ifExists: true });
  pgm.dropTable('LocationKey', { ifExists: true });
  pgm.dropTable('PostalAddress', { ifExists: true });
};
