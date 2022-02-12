import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CurrencyType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    issuer: string;

    @Column()
    value: string;
    
    @Column()
    issued_at: Date;

    @Column()
    expire_at: Date;
}
