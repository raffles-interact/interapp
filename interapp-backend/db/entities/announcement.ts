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
import { AnnouncementAttachment } from './announcement_attachment';

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn()
  announcement_id: number;

  @Column({ type: 'timestamp without time zone' })
  creation_date: string;

  @Column({ unique: true })
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  image?: string | null;

  @Column()
  username: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>;

  @OneToMany(
    () => AnnouncementCompletion,
    (announcement_completion) => announcement_completion.announcement,
    { cascade: true },
  )
  announcement_completions: Relation<AnnouncementCompletion[]>;

  @OneToMany(
    () => AnnouncementAttachment,
    (announcement_attachment) => announcement_attachment.announcement,
    { cascade: true },
  )
  announcement_attachments: Relation<AnnouncementAttachment[]>;
}
