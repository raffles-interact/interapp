import { Entity, Column, PrimaryColumn, ManyToOne, type Relation } from 'typeorm';
import { Announcement } from './announcement';
import { User } from './user';

@Entity()
export class AnnouncementCompletion {
  @PrimaryColumn()
  announcement_id: number;

  @PrimaryColumn()
  user_id: number;

  @ManyToOne(() => Announcement)
  announcement: Relation<Announcement>;

  @ManyToOne(() => User)
  user: Relation<User>;

  @Column()
  completed: boolean;
}
