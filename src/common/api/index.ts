import axios from 'axios';

const getBaseUrl = () => {
  return process.env.schedule_backebd_url;
};
export const getApi = () => {
  return {
    generateLog: getBaseUrl() + '/project-log/generateLog',
  };
};

export const HttpGet = async (url, token, tenantId, params?: any) => {
  try {
    const urls = getApi();
    const res = await axios.get(urls[url], {
      ...(params && { params: params }),
      headers: {
        Authorization: token,
        'x-tenant-id': tenantId,
      },
    });
    return res.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('连接被拒绝:', error.address, error.port);
    }
  }
};

export const HttpPost = async (url, data?: any, token?, tenantId?) => {
  try {
    const urls = getApi();
    const res = await axios.post(urls[url], data, {
      headers: {
        Authorization: token,
        'x-tenant-id': tenantId,
      },
    });
    return res.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('连接被拒绝:', error.address, error.port);
    }
  }
};
