import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { Address } from "../addresses/address.model";

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    address_from_id: number;

    @ManyToOne(() => Address)
    @JoinColumn({ name: 'address_from_id' })
    addressFrom: Address;

    @Column()
    address_to_id: number;

    @ManyToOne(() => Address)
    @JoinColumn({ name: 'address_to_id' })
    addressTo: Address;

    @Column()
    amount: number;

    @Column()
    precision: number;

    //TODO: Move into dictionary after determining all types
    //transfer/buy/sell/vote/etc.
    @Column()
    type: string;

    //TODO: Move into dictionary after determining all statuses
    //draft/signed/processing/success/failed/etc.
    @Column()
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
