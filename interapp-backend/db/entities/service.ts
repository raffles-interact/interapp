import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { UserService } from './user_service';
import { User } from './user';
import { ServiceSession } from './service_session';

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  service_id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string | null;

  @Column()
  enable_scheduled: boolean;

  @Column()
  service_hours: number;

  @Column()
  contact_email: string;

  @Column({ type: 'int', width: 8, nullable: true }) // 8 digit phone number (country code assumed to be +65)
  contact_number?: number | null;

  @Column({ nullable: true })
  website?: string | null;

  @Column({ nullable: true })
  promotional_image?: string | null;

  @Column({ type: 'smallint' })
  day_of_week: DayOfWeek;

  @Column({ type: 'time without time zone' })
  start_time: string;

  @Column({ type: 'time without time zone' })
  end_time: string;

  @Column()
  service_ic_username: string;

  @OneToMany(() => UserService, (user_service) => user_service.service, { cascade: true })
  user_service: Relation<UserService[]>;

  @OneToMany(() => ServiceSession, (service_session) => service_session.service, { cascade: true })
  service_sessions: Relation<ServiceSession[]>;

  @OneToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn()
  service_ic: Relation<User>;
}
