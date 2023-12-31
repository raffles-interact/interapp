import appDataSource from '@utils/init_datasource';
import { HelloWorld } from '@db/entities/hello_world';

export async function hello() {
  const helloWorld = new HelloWorld();

  helloWorld.name = 'Hello World!';

  await appDataSource.manager.save(helloWorld);

  return await appDataSource.manager.find(HelloWorld);
}
