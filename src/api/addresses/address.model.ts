import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { Currency } from "../currencies/currency.model";
import { User } from "../users/user.model";

@Entity()
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    currency_id: number;

    @ManyToOne(() => Currency)
    @JoinColumn({ name: 'currency_id' })
    currency: Currency;

    @Column()
    user_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    address_value: string;

    @Column()
    balance: number;

    @Column()
    balance_precision: number;
}
