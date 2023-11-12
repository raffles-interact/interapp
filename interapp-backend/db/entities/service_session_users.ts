import { Entity, PrimaryColumn, Column, ManyToOne, type Relation } from 'typeorm';
import { Users } from './users';
import { ServiceSessions } from './service_sessions';

@Entity()
export class ServiceSessionUsers {
  @PrimaryColumn()
  service_session_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column()
  ad_hoc: boolean;

  @ManyToOne(() => ServiceSessions, (service_sessions) => service_sessions.service_session_id)
  service_sessions: Relation<ServiceSessions>;

  @ManyToOne(() => Users, (users) => users.user_id)
  users: Relation<Users>;
}
