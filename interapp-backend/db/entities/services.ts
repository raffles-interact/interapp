import { Entity, PrimaryGeneratedColumn, Column, OneToMany, type Relation } from 'typeorm';
import { UserServices } from './user_services';
import { ServiceSessions } from './service_sessions';

@Entity()
export class Services {
  @PrimaryGeneratedColumn()
  service_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  contact_email: string;

  @Column({ type: 'int', width: 8, nullable: true }) // 8 digit phone number (country code assumed to be +65)
  contact_number: number;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'bytea', nullable: true })
  promotional_image: Buffer;

  @OneToMany(() => UserServices, (user_services) => user_services.service_id)
  user_services: Relation<UserServices[]>;

  @OneToMany(() => ServiceSessions, (service_sessions) => service_sessions.service_id)
  service_sessions: Relation<ServiceSessions[]>;
}
