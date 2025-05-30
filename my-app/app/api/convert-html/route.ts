// pages/api/convert-html.ts
// TypeScript
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// type LayoutJSON = {
//   backgroundContainer?: {
//     type: "video" | "image" | "color" | "none";
//     content: string;
//   };
//   contentContainer: {
//     mainHeading?: string;
//     subheading?: string;
//     svg?: string;
//   };
// };

// export async function POST(req: Request) {
//   const body = await req.json();
//   const { rawHtml } = body;
//   if (!rawHtml || typeof rawHtml !== "string") {
//     return new Response(JSON.stringify({ error: "Missing or invalid 'rawHtml' in request body" }), { status: 400 });
//   }

//   try {
//     const prompt = `
// You are an expert HTML parser and converter.

// Given this raw HTML input:

// """${rawHtml}"""

// Convert it into this exact organizational format:

// <section>
//   <div>
//     <!-- Background content: video or image or color -->
//   </div>
//   <div>
//     <h1>Main Heading</h1>
//     <h6>Subheading or descriptive text</h6>
//     <p>Optional text content</p>
//     <!-- Optional SVG or other decorative elements -->
//   </div>
// </section>

// Output a minimal JSON **ONLY** with this structure:

// {
//   "backgroundContainer": {
//     "type": "video" | "image" | "color" | "none",
//     "content": "URL or color code or empty string"
//   },
//   "contentContainer": {
//     "mainHeading": "string or empty",
//     "subheading": "string or empty",
//     "text": "string or empty",
//     "svg": "string SVG markup or empty"
//   }
// }

// Do NOT add any explanations or extra text.
// If a section does not exist, set its value to empty string or "none" accordingly.
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You convert raw HTML to the org's common layout JSON." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0,
//       max_tokens: 800,
//     });

//     const gptResponse = completion.choices[0].message && completion.choices[0].message.content
//       ? completion.choices[0].message.content.trim()
//       : "";

//     let parsed: LayoutJSON;
//     try {
//       parsed = JSON.parse(gptResponse!);
//     } catch (e) {
//       return new Response(JSON.stringify({
//         error: "Failed to parse JSON from OpenAI response",
//         rawResponse: gptResponse,
//       }), { status: 500 });
//     }

//     return new Response(JSON.stringify(parsed), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({
//       error: "Internal server error",
//       details: error instanceof Error ? error.message : String(error),
//     }), { status: 500 });
//   }
// }

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 90000,
});

type LayoutJSON = {
  backgroundContainer: {
    type: "video" | "image" | "color" | "none";
    content: string;
    children: any[];
  };
  contentContainers: Array<{
    mainHeading?: string;
    subheading?: string;
    svg?: string;
    children?: any[];
  }>;
};

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json|```/g, "")    // remove markdown fences
    .replace(/,\s*([}\]])/g, "$1")  // remove trailing commas
    .replace(/[\u0000-\u001F]+/g, "") // remove control chars
    .trim();
}

export async function POST(req: Request) {
  const body = await req.json();
  const { rawHtml } = body;

  if (!rawHtml || typeof rawHtml !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'rawHtml'" }), { status: 400 });
  }

  // Your exact prompt here:
  const prompt = `
You are a strict HTML-to-JSON converter.

Given this raw HTML:
"""${rawHtml}"""

Convert it to this layout format:

<section>
  <div>
    <!-- Background content: video or image or color -->
  </div>
  <div>
    <h1>Main Heading</h1>
    <h6>Subheading or descriptive text</h6>
    <!-- Optional SVG or other decorative elements -->
  </div>
  <div>...</div> <!-- Additional content containers -->
</section>

Now output only valid JSON in this structure:

{
  "backgroundContainer": {
    "type": "video" | "image" | "color" | "none",
    "content": "URL or color code or empty string",
    "children": []
  },
  "contentContainers": [
    {
      "mainHeading": "string or empty",
      "subheading": "string or empty",
      "svg": "string SVG markup or empty",
      "children": []
    }
    // Repeat for multiple content containers
  ]
}
⚠️ Strictly return only valid JSON — no markdown, no explanations, no comments.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You convert raw HTML to a strict layout JSON format. Output ONLY JSON. No markdown, no comments.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 1500,
    });

    const gptOutput = completion.choices[0].message?.content || "";

    const cleaned = cleanJSON(gptOutput);

    let parsed: LayoutJSON;

    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON. Raw OpenAI output:", gptOutput);
      return new Response(
        JSON.stringify({
          error: "Failed to parse JSON from OpenAI response",
          rawResponse: gptOutput,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(parsed), { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
}
