import { Entity, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { Users } from './users';

@Entity()
export class UserPermissions {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  permission_id: number;

  @ManyToOne(() => Users, (users) => users.user_id)
  users: Relation<Users>;
}
