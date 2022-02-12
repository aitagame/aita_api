import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}
