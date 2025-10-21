import { revalidateTag } from "next/cache"
import { getCacheTag } from "./cache-tags"
import type { User } from "@/types/user.type"
import { RegisterSchemaType } from "@/schemas/auth/register.schema"
import { LoginSchemaType } from "@/schemas/auth/login.schema"
import { UserSchemaType } from "@/schemas/user.schema"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getJsonHeaders = () => ({
  "Content-Type": "application/json",
})

export const registerUser = async (values: UserSchemaType) => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (response.ok) {
      return data as User;
    } else {
      console.error(data);
      return {
        error: data.message || 'Error al crear usuario',
        status: response.status,
      };
    }
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear usuario', status: 500 };
  }
};




export const loginUser = async (values: LoginSchemaType) => {
  try {
    console.log("📥 Login con:", values)

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify(values),
    })

    const data = await response.json()

    if (response.ok) {
      return data
    } else {
      console.error("❌ Error en loginUser:", data)
      return null
    }
  } catch (error) {
    console.error("⚠️ Error en loginUser:", error)
    return null
  }
}