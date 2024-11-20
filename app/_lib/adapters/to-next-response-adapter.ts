import { NextResponse } from "next/server";
import { ApiResponse } from "../core/domain/models/routes/api-response";

export const toNextResponseAdapter = (response: ApiResponse): NextResponse => {
  if (response.body === null) {
    return new NextResponse(null, {
      status: response.status,
      headers: response.headers,
    });
  } else {
    return NextResponse.json(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
};
