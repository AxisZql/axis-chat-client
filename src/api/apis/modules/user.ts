import fetch from '@/api/fetch';

/**
 * 更新用户名
 * @param params
 */
export const patchUserName = (params: User) => {
  return fetch.post(`/user/update-info`, {
    ...params,
  });
};

/**
 * 更新用户密码
 * @param user
 * @param password
 *
 */
export const patchPassword = (user: UpdateUserPasswordReq) => {
  return fetch.post(`/user/update-password`, {
    ...user,
  });
};

/**
 * 用户名模糊搜索用户
 * @param username
 */
export const getUsersByName = (searchReq: SearchUserReq) => {
  return fetch.post(`/user/search`, {
    ...searchReq,
  });
};

/**
 * 用户头像上传
 * @param params
 */
export function setUserAvatar(params: FormData) {
  return fetch.post(`/user/upload-avatar`, params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 聊天图片上传
 */
export function uploadChatImage(params: any) {
  return fetch.post(`/user/upload-img`, ...params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 删除用户
 * @param params
 */
export function deleteUser(params: any) {
  return fetch.delete(`/user`, { params: params });
}
