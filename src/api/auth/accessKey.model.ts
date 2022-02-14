import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity()
export class AccessKey {
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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
