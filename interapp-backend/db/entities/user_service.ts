import { Entity, type Relation, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user';
import { Service } from './service';

@Entity()
export class UserService {
  @PrimaryColumn()
  username: string;

  @PrimaryColumn()
  service_id: number;

  @ManyToOne(() => User, (user) => user.user_services, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @ManyToOne(() => Service, (service) => service.user_service, { onDelete: 'CASCADE' })
  service: Relation<Service>;
}
