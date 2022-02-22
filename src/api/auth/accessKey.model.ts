import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/user.model";

@Entity()
export class AccessKey {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user_id => user_id.accessKeys)
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column()
    user_id: number;

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
