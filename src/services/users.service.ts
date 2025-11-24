'use server';

import {
  UpdateProfilePasswordType,
  UpdateProfileSchemaType,
  UserSchemaType,
} from '@/schemas/user.schema';
import { User } from '@/types/user.type';
import { revalidateTag } from 'next/cache';
import { getCacheTag } from './cache-tags';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


const getJsonHeaders = (authToken?: string) => ({
  "Content-Type": "application/json",
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})

export const getUsers = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: getJsonHeaders(authToken),
      next: {
        tags: [getCacheTag('users', 'all')],
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data as User;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserById = async (id: string, authToken?: string) => {
  try {
    if (!id) return null;

    const response = await fetch(`${BASE_URL}/users/${id}`, {
      headers: getJsonHeaders(authToken),
    });
    const data = await response.json();

    if (response.ok) {
      return data as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};


export const createUser = async (user: UserSchemaType, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: getJsonHeaders(authToken),
      body: JSON.stringify(user),
    });
    const data = await response.json();

    if (response.ok) {
      return data as User;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateUser = async (
  id: string,
  user: Partial<UpdateProfileSchemaType>,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: await getJsonHeaders(authToken),
      body: JSON.stringify(user),
    });

    const data = await response.json();
    revalidateTag(getCacheTag('users', 'all'));
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getJsonHeaders(authToken),
    });

    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('users', 'all'));
      return data;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

