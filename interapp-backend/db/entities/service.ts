import { Entity, PrimaryGeneratedColumn, Column, OneToMany, type Relation } from 'typeorm';
import { UserService } from './user_service';
import { ServiceSession } from './service_session';

@Entity()
export class Service {
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

  @OneToMany(() => UserService, (user_service) => user_service.service_id)
  user_service: Relation<UserService[]>;

  @OneToMany(() => ServiceSession, (service_session) => service_session.service_id)
  service_sessions: Relation<ServiceSession[]>;
}
