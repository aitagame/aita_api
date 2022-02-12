import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    severity: string;

    @Column()
    message: number;

    //TODO: Complete
}
