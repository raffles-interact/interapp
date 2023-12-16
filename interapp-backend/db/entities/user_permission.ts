import { Entity, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { User } from './user';

@Entity()
export class UserPermission {
  @PrimaryColumn()
  username: string;

  @PrimaryColumn()
  permission_id: number;

  @ManyToOne(() => User, (user) => user.user_permissions, { onDelete: 'CASCADE' })
  user: Relation<User>;
}
