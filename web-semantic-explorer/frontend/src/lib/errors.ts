import { AxiosError } from "axios"

import type { ApiError } from "@/client"

function extractErrorMessage(err: ApiError): string {
  if (err instanceof AxiosError) {
    return err.message
  }

  const errDetail = (err.body as { detail?: string | Array<{ msg: string }> })
    ?.detail

  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }

  if (typeof errDetail === "string") {
    return errDetail
  }

  return "Something went wrong."
}

/** Enlaza un toast/callback como `this` y muestra el mensaje de error de la API. */
export function handleError(this: (msg: string) => void, err: ApiError) {
  this(extractErrorMessage(err))
}
