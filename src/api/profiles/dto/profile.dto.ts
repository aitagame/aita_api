export default class ProfileDto {
  id: number;
  name: string;
  //TODO: Consider replacing with ENUM
  class: string;
  rating: number;
  is_my: boolean;
}