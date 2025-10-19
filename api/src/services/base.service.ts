export default class BaseService {
  constructor() {
  }
  async fetch(url: string, options: RequestInit = {}) {
    const response = await fetch(`${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'thoh-client',
        ...options.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
  async get(url: string) {
    const response = await this.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'thoh-client',
      },
    });
    return response;
  }

  async post(url: string, requestBody = {}) {
    try {
      const body = JSON.stringify(requestBody);
      const response = await fetch(`${url}`, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': 'thoh-client'
        },
      });
      return response.json();
    } catch (error) {
      throw error;
    }
  }
}
