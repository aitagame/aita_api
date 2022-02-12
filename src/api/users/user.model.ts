import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Clan } from "../clans/clan.model";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clan_id: number;

    @ManyToOne(() => Clan)
    @JoinColumn({ name: 'clan_id' })
    clan: Clan;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;
}
