import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, type Relation } from 'typeorm';
import { Users } from './users';

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn()
  announcement_id: number;

  @Column()
  creation_date: Date;

  @Column()
  description: string;

  @Column({ type: 'bytea', nullable: true })
  attachment: Buffer;

  @ManyToOne(() => Users, (user) => user.user_id)
  user_id: Relation<Users>;
}
