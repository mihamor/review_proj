import knex from 'knex';
import _ from 'lodash';


export const insertUpdate = (pg: knex, table: string, data: any[], pks: string[] = ['id']) => {
	const firstData = data[0] ? data[0] : data;
	const fields = _.difference(_.keys(firstData), pks);
	const str = _.map(fields, (o) => {
		return ('"%s" = excluded."%s"').replace(/%s/gi, o);
	});
	return pg.raw(pg(table).insert(data).toQuery() + " ON CONFLICT (id) DO UPDATE SET " + str.join(", ") + ' RETURNING *');
}
