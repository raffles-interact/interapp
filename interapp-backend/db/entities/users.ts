import { Entity, Column, PrimaryGeneratedColumn, OneToMany, type Relation } from 'typeorm';
import { UserPermissions } from './user_permissions';
import { UserServices } from './user_services';
import { ServiceSessionUsers } from './service_session_users';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  service_hours: number;

  @OneToMany(() => UserPermissions, (user_permissions) => user_permissions.user_id)
  user_permissions: Relation<UserPermissions[]>;

  @OneToMany(() => UserServices, (user_services) => user_services.user_id)
  user_services: Relation<UserServices[]>;

  @OneToMany(() => ServiceSessionUsers, (service_session_users) => service_session_users.user_id)
  service_session_users: Relation<ServiceSessionUsers[]>;
}
