import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Clan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
