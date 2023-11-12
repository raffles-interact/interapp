import { Entity, Column, PrimaryColumn, ManyToOne, type Relation } from 'typeorm';
import { Announcement } from './announcement';
import { Users } from './users';

@Entity()
export class AnnouncementCompletion {
  @PrimaryColumn()
  announcement_id: number;

  @PrimaryColumn()
  user_id: number;

  @ManyToOne(() => Announcement, (announcement) => announcement.announcement_id)
  announcement: Relation<Announcement>;

  @ManyToOne(() => Users, (user) => user.user_id)
  user: Relation<Users>;

  @Column()
  completed: boolean;
}
