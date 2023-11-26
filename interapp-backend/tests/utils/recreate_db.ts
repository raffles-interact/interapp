import appDataSource from '@utils/init_datasource';

export const recreateDB = async () => {
  const entities = appDataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = appDataSource.getRepository(entity.name);
    const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');

    await repository.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
  }
};
