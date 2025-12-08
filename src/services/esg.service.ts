import { Esg } from "@/types/esg.type"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getJsonHeaders = (authToken?: string) => ({
  "Content-Type": "application/json",
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
})

// ✅ recibe un objeto con los datos de tipo Esg
export const createEsg = async (data: Esg, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/esg-jobs`, {
      method: "POST", // 👈 importante
      headers: getJsonHeaders(authToken),
      body: JSON.stringify(data), // 👈 enviar el dto en el body
    })

    const result = await response.json()

    if (response.ok) {
      return result
    } else {
      console.error("❌ Error del backend:", result)
      return null
    }
  } catch (error) {
    console.error("❌ Error al crear análisis ESG:", error)
    return null
  }
}

export const updateAnalysisJson = async (id: string, body: any, authToken?: string) => {
  try {
    console.log('🧩 Enviando JSON al backend:', body)

    const response = await fetch(`${BASE_URL}/esg-analysis/${id}/json`, {
      method: "PUT",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("✅ Backend respondió:", result)
      return result
    } else {
      console.error("❌ Error del backend:", result)
      return null
    }
  } catch (error) {
    console.error("💥 Error al actualizar análisis ESG:", error)
    return null
  }
}


export const getGriByTemas = async (temas: string[], authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/esg-analysis/gri/by-topics`, {
      method: "POST",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify({ temas }),  
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      console.error("Error del backend:", result);
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo contenidos GRI:", error);
    return null;
  }
};

export const getSasb = async (
  industria: string,
  esgAnalysisId: string,
  authToken?: string
) => {
  try {
    const response = await fetch(`${BASE_URL}/esg-analysis/sasb`, {
      method: "POST",
      headers: getJsonHeaders(authToken),
      body: JSON.stringify({ industria, esgAnalysisId }),
    })

    const result = await response.json()

    if (response.ok) return result

    console.error("Error del backend:", result)
    return null
  } catch (error) {
    console.error("Error obteniendo sasb:", error)
    return null
  }
}


