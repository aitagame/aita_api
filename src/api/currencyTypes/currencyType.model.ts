import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CurrencyType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
