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

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  ad_hoc_enabled: boolean;

  @ManyToOne(() => Service, (service) => service.service_id)
  services: Relation<Service>;

  @OneToMany(
    () => ServiceSessionUser,
    (service_session_user) => service_session_user.service_session_id,
  )
  service_session_users: Relation<ServiceSessionUser[]>;
}
