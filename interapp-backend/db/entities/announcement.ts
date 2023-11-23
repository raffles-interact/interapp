import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, type Relation } from 'typeorm';
import { User } from './user';

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

  @Column()
  username: string;

  @ManyToOne(() => User)
  user: Relation<User>;
}
