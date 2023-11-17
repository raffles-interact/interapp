import { Entity, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { User } from './user';

@Entity()
export class UserPermission {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  permission_id: number;

  @ManyToOne(() => User, (user) => user.user_permissions)
  user: Relation<User>;
}