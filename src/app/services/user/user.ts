export interface User {
  UserId: string;
  FirstName: string;
  LastName: string;
  Email: string;
  ImagePath: string;
  Role: string;
}

export interface UserResponse {
  value: User[];
  "@odata.count": number;
}
