import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { Services } from './services';
import { ServiceSessionUsers } from './service_session_users';

@Entity()
export class ServiceSessions {
  @PrimaryGeneratedColumn()
  service_session_id: number;

  @Column()
  service_id: number;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  ad_hoc_enabled: boolean;

  @ManyToOne(() => Services, (services) => services.service_id)
  services: Relation<Services>;

  @OneToMany(
    () => ServiceSessionUsers,
    (service_session_users) => service_session_users.service_session_id,
  )
  service_session_users: Relation<ServiceSessionUsers[]>;
}
