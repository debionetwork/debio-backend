import { ApiProperty } from "@nestjs/swagger";

export class EmailNotificationDto {
	@ApiProperty({
		type: String,
		description: 'ref_number',
	})
	ref_number: string;

	@ApiProperty({
		type: String,
		description: 'status',
	})
	status: string;

	@ApiProperty({
		type: Date,
		description: 'created_at',
	})
	created_at: Date;

	@ApiProperty({
		type: Date,
		description: 'sent_at',
	})
	sent_at: Date;
}