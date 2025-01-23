import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OAuthProvider } from '../enums/user.enum';
import { User } from './user.entity';

@Entity()
export class OAuthCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: OAuthProvider,
  })
  provider: OAuthProvider;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ type: 'jsonb', nullable: true })
  providerData: Record<string, any>;

  @ManyToOne(() => User, (user) => user.oauthCredentials)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
