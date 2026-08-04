import { NextResponse } from "next/server";

import { UnauthorizedError, ValidationError } from "@/lib/errors";
import { UPLOAD_LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Signed upload bootstrap.
 * Full attachment binding lands with Planner / Knowledge modules.
 */
export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: { code: "ENV_MISSING", message: "Supabase is not configured" } },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const error = new UnauthorizedError();
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  const body = (await request.json()) as {
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  };

  if (!body.fileName || !body.mimeType || typeof body.sizeBytes !== "number") {
    const error = new ValidationError("fileName, mimeType, and sizeBytes are required");
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (body.sizeBytes > UPLOAD_LIMITS.maxBytes) {
    const error = new ValidationError("File exceeds the 25MB upload limit");
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  const allowed = UPLOAD_LIMITS.allowedMimePrefixes.some((prefix) =>
    body.mimeType!.startsWith(prefix),
  );

  if (!allowed) {
    const error = new ValidationError("MIME type is not allowed");
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "NOT_IMPLEMENTED",
        message:
          "Signed upload URLs require Supabase Storage policies from Step 7.",
      },
    },
    { status: 501 },
  );
}
