import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// sanity check
@Entity()
export class HelloWorld {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
