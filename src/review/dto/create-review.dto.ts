import { IsString, IsInt, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @Max(5)
  @Min(1, { message: `Rating can't be less then 1` })
  @IsInt()
  rating: number;

  @IsString()
  productId: string;
}
