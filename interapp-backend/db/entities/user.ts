import { Entity, Column, PrimaryColumn, OneToMany, type Relation } from 'typeorm';
import { UserPermission } from './user_permission';
import { UserService } from './user_service';
import { ServiceSessionUser } from './service_session_user';

@Entity()
export class User {
  @PrimaryColumn()
  username: string;

  @Column({ unique: true })
  user_id: number;

  @Column()
  email: string;

  @Column()
  password_hash: string;

  @Column()
  verified: boolean;

  @Column()
  service_hours: number;

  @OneToMany(() => UserPermission, (user_permission) => user_permission.user)
  user_permissions: Relation<UserPermission[]>;

  @OneToMany(() => UserService, (user_service) => user_service.user)
  user_service: Relation<UserService[]>;

  @OneToMany(() => ServiceSessionUser, (service_session_user) => service_session_user.user)
  service_session_users: Relation<ServiceSessionUser[]>;
}
