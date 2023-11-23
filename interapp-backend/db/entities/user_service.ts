import { Entity, type Relation, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user';
import { Service } from './service';

@Entity()
export class UserService {
  @PrimaryColumn()
  username: string;

  @PrimaryColumn()
  service_id: number;

  @ManyToOne(() => User, (user) => user.user_service)
  user: Relation<User>;

  @ManyToOne(() => Service, (service) => service.user_service)
  service: Relation<Service>;
}
