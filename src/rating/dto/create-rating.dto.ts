export class CreateRatingDto {
  lab_id : string;
  service_id : string;
  order_id : string;
  rating_by : string;
  rating : number;
  created : Date;
}