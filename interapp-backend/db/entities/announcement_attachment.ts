import { Entity, PrimaryColumn, Column, ManyToOne, type Relation } from 'typeorm';
import { Announcement } from './announcement';

@Entity()
export class AnnouncementAttachment {
  @PrimaryColumn()
  attachment_loc: string;

  @Column()
  attachment_name: string;

  @Column()
  attachment_mime: string;

  @Column()
  announcement_id: number;

  @ManyToOne(() => Announcement, (announcement) => announcement.announcement_completions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  announcement: Relation<Announcement>;
}
