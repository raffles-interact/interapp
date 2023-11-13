import { Entity, type Relation, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user';
import { Service } from './service';

@Entity()
export class UserService {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  service_id: number;

  @ManyToOne(() => User, (user) => user.user_id)
  user: Relation<User>;

  @ManyToOne(() => Service, (service) => service.service_id)
  services: Relation<Service>;
}
