import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    address_from_id: number;

    @Column()
    address_to_id: number;

    @Column()
    amount: number;

    @Column()
    precision: number;

    //TODO: Complete
}
