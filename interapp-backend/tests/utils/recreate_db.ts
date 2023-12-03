import appDataSource from '@utils/init_datasource';

export const recreateDB = async () => {
  const entities = appDataSource.entityMetadatas;

  const tableNames = entities.map((entity) => `"${entity.tableName}"`).join(', ');
  const queryRunner = appDataSource.createQueryRunner();

  await queryRunner.manager.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
};
