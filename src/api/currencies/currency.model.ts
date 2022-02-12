import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
