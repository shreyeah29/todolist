import { NextResponse } from "next/server";

/**
 * Local mode: file uploads can be added later via IndexedDB blobs.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: {
        code: "LOCAL_MODE",
        message:
          "File uploads are not enabled in local mode yet. Notes and tasks work fully offline.",
      },
    },
    { status: 501 },
  );
}
