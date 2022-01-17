import { Column, Entity,  PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'email_notification'})
export class EmailNotification {
	@PrimaryGeneratedColumn({ type: 'bigint'})
	id: string;

	@Column()
	ref_number: string;

	@Column()
	notification_type: string;

	@Column()
	status: string;

	@Column()
	created_at: Date;

	@Column()
	sent_at: Date;
}