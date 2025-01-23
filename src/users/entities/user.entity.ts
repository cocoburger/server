import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import {
  Gender,
  SecurityLevel,
  AccommodationType,
  TransportationType,
} from '../enums/user.enum';
import { OAuthCredential } from './oauth-credential.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  @Column({ nullable: true })
  country: string | null;

  @Column({
    type: 'enum',
    enum: SecurityLevel,
    default: SecurityLevel.MEDIUM,
  })
  securityLevel: SecurityLevel;

  @Column({ nullable: true })
  age: number | null;

  @Column('simple-array', { nullable: true })
  preferredLanguage: string[] | null;

  @Column('jsonb', { nullable: true })
  travelPreferences: {
    preferredDestinations: string[];
    transportationPreference: TransportationType;
    accommodationType: AccommodationType[];
  } | null;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginDate: Date;

  @CreateDateColumn()
  accountCreationDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OAuthCredential, (credential) => credential.user)
  oauthCredentials: OAuthCredential[];
}
