import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Currency {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    currency_id: number;

    @Column()
    user_id: number;

    @Column()
    address_value: string;

    @Column()
    balance: number;

    @Column()
    balance_precision: number;
    
    //TODO: Complete
}
