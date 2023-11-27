import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { Service } from './service';
import { ServiceSessionUser } from './service_session_user';

@Entity()
export class ServiceSession {
  @PrimaryGeneratedColumn()
  service_session_id: number;

  @Column()
  service_id: number;

  @Column({ type: 'timestamp without time zone' })
  start_time: string;

  @Column({ type: 'timestamp without time zone' })
  end_time: string;

  @Column()
  ad_hoc_enabled: boolean;

  @ManyToOne(() => Service, (service) => service.service_sessions)
  service: Relation<Service>;

  @OneToMany(
    () => ServiceSessionUser,
    (service_session_user) => service_session_user.service_session,
  )
  service_session_users: Relation<ServiceSessionUser[]>;
}
