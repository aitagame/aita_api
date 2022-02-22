import { createHash } from "crypto";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, OneToMany } from "typeorm";
import { AccessKey } from "../auth/accessKey.model";
import { Clan } from "../clans/clan.model";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    clan_id: number;

    @ManyToOne(() => Clan)
    @JoinColumn({ name: 'clan_id' })
    clan: Clan;

    @OneToMany(() => AccessKey, accessKey => accessKey.user_id)
    accessKeys: AccessKey[];

    @Column()
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true, select: false })
    password: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
