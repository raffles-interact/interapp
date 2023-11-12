import { Entity, type Relation, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from './users';
import { Services } from './services';

@Entity()
export class UserServices {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  service_id: number;

  @ManyToOne(() => Users, (users) => users.user_id)
  users: Relation<Users>;

  @ManyToOne(() => Services, (services) => services.service_id)
  services: Relation<Services>;
}
