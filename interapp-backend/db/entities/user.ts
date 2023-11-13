import { Entity, Column, PrimaryGeneratedColumn, OneToMany, type Relation } from 'typeorm';
import { UserPermission } from './user_permission';
import { UserService } from './user_service';
import { ServiceSessionUser } from './service_session_user';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  service_hours: number;

  @OneToMany(() => UserPermission, (user_permission) => user_permission.user_id)
  user_permissions: Relation<UserPermission[]>;

  @OneToMany(() => UserService, (user_service) => user_service.user_id)
  user_service: Relation<UserService[]>;

  @OneToMany(() => ServiceSessionUser, (service_session_user) => service_session_user.user_id)
  service_session_users: Relation<ServiceSessionUser[]>;
}
