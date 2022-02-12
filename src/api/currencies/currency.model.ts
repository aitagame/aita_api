import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Currency {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    currency_type_id: number;

    //Only for tokens
    @Column()
    contract_address_id: number;

    @Column()
    name: string;

    //Asset name
    @Column()
    code: string;

    //TODO: Complete
}
