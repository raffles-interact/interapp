import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { User } from './user';
import { AnnouncementCompletion } from './announcement_completion';

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn()
  announcement_id: number;

  @Column()
  creation_date: Date;

  @Column()
  description: string;

  @Column({ type: 'bytea', nullable: true })
  attachment: string;

  @Column()
  username: string;

  @ManyToOne(() => User)
  user: Relation<User>;

  @OneToMany(
    () => AnnouncementCompletion,
    (announcement_completion) => announcement_completion.announcement,
    { cascade: true },
  )
  announcement_completions: Relation<AnnouncementCompletion[]>;
}
