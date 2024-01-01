import { Entity, Column, PrimaryColumn, ManyToOne, type Relation } from 'typeorm';
import { Announcement } from './announcement';
import { User } from './user';

@Entity()
export class AnnouncementCompletion {
  @PrimaryColumn()
  announcement_id: number;

  @PrimaryColumn()
  username: string;

  @Column()
  completed: boolean;

  @ManyToOne(() => Announcement, (announcement) => announcement.announcement_completions, {
    onDelete: 'CASCADE', onUpdate: 'CASCADE',
  })
  announcement: Relation<Announcement>;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>;
}
