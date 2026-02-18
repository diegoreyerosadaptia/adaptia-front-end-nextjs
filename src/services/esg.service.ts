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


export type OdsOpt = { code: string; label: string }

export type OdsOptionsResponse = {
  objectives: OdsOpt[]
  metas: OdsOpt[]
  indicadores: OdsOpt[]
}

export const getOdsOptions = async (
  params?: { objective?: string; meta?: string },
  authToken?: string
): Promise<OdsOptionsResponse | null> => {
  try {
    const qs = new URLSearchParams()
    if (params?.objective) qs.set("objective", params.objective)
    if (params?.meta) qs.set("meta", params.meta)

    const response = await fetch(`${BASE_URL}/esg-analysis/ods-list/options?${qs.toString()}`, {
      method: "GET",
      headers: getJsonHeaders(authToken),
    })

    const result = await response.json()

    if (response.ok) return result

    console.error("❌ Error del backend (getOdsOptions):", result)
    return null
  } catch (error) {
    console.error("💥 Error obteniendo ODS options:", error)
    return null
  }
}



// ===============================
// ✅ ODS hidden columns (ADMIN)
// ===============================
type ColKey = "tema" | "ods" | "meta_ods" | "indicador_ods"
export type HiddenColsDto = Partial<Record<ColKey, boolean>>

export const getEsgAnalysisById = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/esg-analysis/${id}`, {
      method: "GET",
      headers: getJsonHeaders(authToken),
    })

    const result = await response.json()

    if (response.ok) return result

    console.error("❌ Error del backend (getEsgAnalysisById):", result)
    return null
  } catch (error) {
    console.error("💥 Error obteniendo análisis ESG:", error)
    return null
  }
}

export const setOdsHiddenCols = async (
  esgAnalysisId: string,
  body: HiddenColsDto,
  authToken?: string
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/esg-analysis/${esgAnalysisId}/ods-hidden-cols`,
      {
        method: "PATCH",
        headers: getJsonHeaders(authToken),
        body: JSON.stringify(body),
      }
    )

    const result = await response.json()

    if (response.ok) return result

    console.error("❌ Error del backend (setOdsHiddenCols):", result)
    return null
  } catch (error) {
    console.error("💥 Error guardando hiddenCols:", error)
    return null
  }
}
