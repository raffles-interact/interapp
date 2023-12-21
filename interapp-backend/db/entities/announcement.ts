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

  @Column({ type: 'timestamp without time zone' })
  creation_date: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  attachment?: string;

  @Column()
  username: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @OneToMany(
    () => AnnouncementCompletion,
    (announcement_completion) => announcement_completion.announcement,
    { cascade: true },
  )
  announcement_completions: Relation<AnnouncementCompletion[]>;
}
