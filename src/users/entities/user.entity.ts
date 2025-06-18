/* eslint-disable prettier/prettier */
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

// *********************************************************************************************
// * Definindo entidades para armazenar os dados do ususario                                   *
// *********************************************************************************************

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    password: string | null;

    @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
    role: 'admin' | 'user';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    // *********************************************************************************************
    // * Campo que armazena a data/hora do último login do usuário. Pode ser nulo inicialmente.    *
    // *********************************************************************************************
    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt?: Date;

    @Column({ nullable: true })
    picture?: string;

    @Column({ default: false })
    isOAuth: boolean;
}
