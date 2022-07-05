import fetch from '@/api/fetch';

/**
 * 群名模糊搜索用户
 * @param string
 */
export function getGroupsByName(searchGroupReq: SearchGroupReq) {
  return fetch.post(`/group/search`, {
    ...searchGroupReq,
  });
}

/**
 * 群分页消息
 * @param params
 */
export async function getGroupMessages(params: PagingParams) {
  return await fetch.post(`/group/chat-history`, {
    ...params,
  });
}

/**
 * 创建群聊
 * @param group
 */

export async function CreateGroup(createGroupReq: CreateGroupReq) {
  return fetch.post(`/group/create`, {
    ...createGroupReq,
  });
}
