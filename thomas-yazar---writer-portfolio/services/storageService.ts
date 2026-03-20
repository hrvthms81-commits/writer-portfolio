import { Work, User } from '../types';

const USER_KEY = 'writer_portfolio_user';

export const getAccessCode = async (): Promise<string> => {
  try {
    const response = await fetch('/api/access-code');
    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error('Error fetching access code:', error);
    return import.meta.env.VITE_ACCESS_CODE || 'MEMBER2026';
  }
};

export const setAccessCode = async (code: string): Promise<void> => {
  try {
    await fetch('/api/access-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  } catch (error) {
    console.error('Error setting access code:', error);
  }
};

export const getWorks = async (): Promise<Work[]> => {
  try {
    const response = await fetch('/api/works');
    return await response.json();
  } catch (error) {
    console.error('Error fetching works:', error);
    return [];
  }
};

export const getWorkById = async (id: string): Promise<Work | null> => {
  try {
    const response = await fetch(`/api/works/${id}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching work ${id}:`, error);
    return null;
  }
};

export const saveWork = async (work: Work): Promise<void> => {
  try {
    const response = await fetch('/api/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(work),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error details:', errorData);
      alert(`Failed to save: ${errorData.message || errorData.error || 'Unknown error'}`);
      return;
    }
  } catch (error) {
    console.error('Error saving work:', error);
    alert('Network error while saving. Check your connection.');
  }
};

export const deleteWork = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/works/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting work:', error);
  }
};

export const incrementWorkView = async (id: string): Promise<Work[]> => {
  try {
    const response = await fetch(`/api/works/${id}/view`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error incrementing view:', error);
    return [];
  }
};

export const incrementWorkDownload = async (id: string): Promise<Work[]> => {
  try {
    const response = await fetch(`/api/works/${id}/download`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Error incrementing download:', error);
    return [];
  }
};

export const getCurrentUser = (): User => {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) return JSON.parse(stored);
  return { username: 'Guest', role: 'guest' };
};

export const loginUser = (username: string, isAdmin: boolean): User => {
  const user: User = {
    username,
    role: isAdmin ? 'admin' : 'user',
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const adminLogin = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return loginUser(data.username, true);
    }
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem(USER_KEY);
};
