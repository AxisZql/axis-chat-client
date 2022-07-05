interface User {
  key: string; //user_+id
  userid: number;
  id: number;
  username: string;
  password: string;
  avatar: string;
  role?: number;
  online: string; //对应用户的在线状态y或n
  status?: number;
  tag?: string;
  createAt: string;
}

interface GetUserInfoByTokenReq {
  accessToken: string;
}

interface UpdateUserPasswordReq {
  accessToken: string;
  oldPassword: string;
  newPassword1: string;
  newPassword2: string;
}

interface SearchUserReq {
  accessToken: string;
  username: string;
}
