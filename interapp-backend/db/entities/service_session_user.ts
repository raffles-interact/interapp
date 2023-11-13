import { Entity, PrimaryColumn, Column, ManyToOne, type Relation } from 'typeorm';
import { User } from './user';
import { ServiceSession } from './service_session';

@Entity()
export class ServiceSessionUser {
  @PrimaryColumn()
  service_session_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column()
  ad_hoc: boolean;

  @ManyToOne(() => ServiceSession, (service_session) => service_session.service_session_id)
  service_sessions: Relation<ServiceSession>;

  @ManyToOne(() => User, (user) => user.user_id)
  user: Relation<User>;
}
